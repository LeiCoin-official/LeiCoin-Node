import { AddressHex as AddressHexClass } from "../objects/address.js";
import { Signature as SignatureClass } from "../crypto/signature.js";
import { Uint256 as Uint256Class, Uint64, Uint8 } from "../binary/uint.js";
import { PX as PXClass } from "../objects/prefix.js";
import { Uint } from "../binary/uint.js";
import ObjectEncoding from "./objects.js";
import { AnyObj } from "../utils/dataUtils.js";


interface EncodeableObjInstance {
    encodeToHex(forHash: boolean): Uint;
}

interface EncodeableObj {
    new(...args: any[]): EncodeableObjInstance;
    prototype: EncodeableObjInstance;
    fromDecodedHex(hexData: Uint, returnLength: boolean): { data: EncodeableObjInstance, length: number } | EncodeableObjInstance | null;
}


export abstract class DataEncoder {

    constructor(
        readonly key: string,
        readonly hashRemove: boolean
    ) {}

    abstract encode(v: any): Uint[] | null;
    abstract decode(v: Uint): {
        data: any,
        length: number
    } | null;

}

class ArrayEncoder extends DataEncoder {
    
    constructor(
        key: string,
        readonly prefixLength: number | "unlimited",
        readonly targetObject: EncodeableObj,
        hashRemove: boolean
    ) {
        super(key, hashRemove);
    }

    public encode(array: any[]) {
        const result: Uint[] = [];

        // length check implemeting later
        if (this.prefixLength === "unlimited") {
            result.push(ObjectEncoding.encodeLengthForUnlimited(array.length));
        } else {
            result.push(Uint.from(array.length, this.prefixLength));
        }

        for (let item of array) {
            result.push(this.targetObject.prototype.encodeToHex.call(item, false));
        }

        return result;
    }

    public decode(arrayDataWithPrefix: Uint) {
        const final_array = [];
        let arrayCount, prefixLength;

        if (this.prefixLength === "unlimited") {
            [arrayCount, prefixLength] = ObjectEncoding.decodeLengthFromUnlimited(arrayDataWithPrefix);
        } else {
            prefixLength = this.prefixLength;
            arrayCount = arrayDataWithPrefix.slice(0, prefixLength).toInt();
        }

        let arrayData = arrayDataWithPrefix.slice(prefixLength);
        let total_arrayLength = prefixLength;
            
        for (let i = 0; i < arrayCount; i++) {
            const array_item = this.targetObject.fromDecodedHex(arrayData, true) as { data: any, length: number };
            final_array.push(array_item.data);
            arrayData = arrayData.slice(array_item.length);
            total_arrayLength += array_item.length;
        }

        return {
            data: final_array,
            length: total_arrayLength
        };
    }

}

class ObjectEncoder extends DataEncoder {

    constructor(
        key: string,
        readonly targetObject: EncodeableObj,
        hashRemove: boolean
    ) {
        super(key, hashRemove);
    }

    public encode(object: AnyObj) {
        return [this.targetObject.prototype.encodeToHex.call(object, false)];
    }

    public decode(hexData: Uint) {
        return this.targetObject.fromDecodedHex(hexData, true) as { data: any, length: number };
    }
}

class BigIntEncoder extends DataEncoder {

    readonly prefixLength = 1;

    public encode(value: Uint64) {
        const hexValue = value.toShortUint();
        const hexValueLength = Uint.from(hexValue.getLen(), this.prefixLength);
        return [hexValueLength, hexValue];
    }

    public decode(hexDataWithPrefix: Uint) {
        const dataLength = hexDataWithPrefix.slice(0, this.prefixLength).toInt();
        const totalLength = this.prefixLength + dataLength;
        const hexValue = hexDataWithPrefix.slice(this.prefixLength, totalLength);
        if (hexValue.getLen() !== dataLength) return null;
        return {
            data: Uint64.create(hexValue),
            length: totalLength
        };
    }
}

class BoolEncoder extends DataEncoder {

    readonly fixedLength = 1;

    public encode(value: boolean) {
        return [value ? Uint8.from(1) : Uint8.from(0)];
    }

    public decode(hexData: Uint) {
        const hexValue = hexData.slice(0, this.fixedLength);
        if (hexValue.getLen() !== this.fixedLength) {
            return null;
        }
        return {
            data: hexValue.eq(1),
            length: this.fixedLength
        };
    }
}

class AdvancedTypeEncoderFactory {

    static create<T extends Uint>(type: {
        readonly byteLength: number,
        create: (v: Uint) => T,
    }) {
        return class BinaryDataEncoder extends DataEncoder {

            readonly prefixLength = type.byteLength;

            public encode(v: Uint) {
                return [v];
            }

            public decode(hexData: Uint) {
                const hexValue = hexData.slice(0, this.prefixLength);
                if (hexValue.getLen() !== this.prefixLength) {
                    return null;
                }
                return {
                    data: type.create(hexValue),
                    length: hexValue.getLen()
                };
            }
        }
    }

}

class CustomEncoder extends DataEncoder {

    readonly prefixLength?: number | "unlimited";
    readonly fixedLength?: number;

    constructor(
        key: string,
        length: { type: "prefix", val: number | "unlimited"} | { type: "fixed", val: number },
        hashRemove: boolean
    ) {
        super(key, hashRemove);

        if (length.type === "prefix") {
            this.prefixLength = length.val;
        } else if (length.type === "fixed") {
            this.fixedLength = length.val;
        }
    }

    public encode(value: Uint) {

        if (this.prefixLength) {
            if (this.prefixLength === "unlimited") {
                const hexValueLength = ObjectEncoding.encodeLengthForUnlimited(value.getLen());
                return [hexValueLength, value];
            }

            const hexValueLength = Uint.from(value.getLen(), this.prefixLength);
            return [hexValueLength, value];
        } else if (this.fixedLength && value.getLen() !== this.fixedLength) {
            return null;
        }

        return [value];
    }

    public decode(hexData: Uint) {
        
        let hexValueLength = 0;
        let totalLength = 0;

        if (this.fixedLength) {

            hexValueLength = this.fixedLength;
            totalLength = this.fixedLength;

        } else if (this.prefixLength) {
            let prefixLength = 0;

            if (this.prefixLength === "unlimited") {
                const lengthPrefixData = ObjectEncoding.decodeLengthFromUnlimited(hexData);
                hexValueLength = lengthPrefixData[0];
                prefixLength = lengthPrefixData[1];
            } else {
                prefixLength = this.prefixLength;
                hexValueLength = hexData.slice(0, this.prefixLength).toInt();
            }

            totalLength = prefixLength + hexValueLength;
            hexData = hexData.slice(prefixLength);
        }
            
        let hexValue = hexData.slice(0, 0 + hexValueLength);
        if (hexValue.getLen() !== hexValueLength) {
            return null;
        }

        return {
            data: hexValue,
            length: totalLength
        };
    }


}

const AddressEncoder = AdvancedTypeEncoderFactory.create(AddressHexClass);
const SignatureEncoder = AdvancedTypeEncoderFactory.create(SignatureClass);
const Uint256Encoder = AdvancedTypeEncoderFactory.create(Uint256Class);
const PXEncoder = AdvancedTypeEncoderFactory.create(PXClass);

export namespace BE {
    export const BigInt = (key: string, hashRemove = false) => new BigIntEncoder(key, hashRemove);
    export const Bool = (key: string, hashRemove = false) => new BoolEncoder(key, hashRemove);

    export const Address = (key: string, hashRemove = false) => new AddressEncoder(key, hashRemove);
    export const Signature = (key: string, hashRemove = false) => new SignatureEncoder(key, hashRemove);
    export const Uint256 = (key: string, hashRemove = false) => new Uint256Encoder(key, hashRemove);
    export const Hash = Uint256;
    export const PX = (key: string, hashRemove = false) => new PXEncoder(key, hashRemove);

    export const Array = (
        key: string,
        prefixLength: number | "unlimited",
        targetObject: EncodeableObj,
        hashRemove = false
    ) => new ArrayEncoder(key, prefixLength, targetObject, hashRemove);

    export const Object = (
        key: string,
        targetObject: EncodeableObj,
        hashRemove = false
    ) => new ObjectEncoder(key, targetObject, hashRemove);

    export const Custom = (
        key: string,
        length: { type: "prefix", val: number | "unlimited"} | { type: "fixed", val: number },
        hashRemove = false
    ) => new CustomEncoder(key, length, hashRemove);
}

export { BE as BEncoder };

