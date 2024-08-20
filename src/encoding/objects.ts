import { Uint } from "../binary/uint.js";
import { CB } from "../utils/callbacks.js";
import { AnyObj, Dict } from "../utils/dataUtils.js";
import { DataEncoder } from "./binaryEncoders.js";
import EncodingUtils from "./index.js";

/*
//type NonBinaryBasicTypes = "string" | "int";
type BasicTypes = "bigint" | "array" | "bool" | "object";
type AdvancedTypes = "address" | "hash" | "signature" | "nonce" | "version";
type DefaultDataTypes = BasicTypes | AdvancedTypes /*| NonBinaryBasicTypes*/;
/*
export interface EncodingSettings {
    key: string;
    length?: number;
    lengthBefore?: boolean | "unlimited";
    type?: DefaultDataTypes;
    hashRemove?: boolean,
    decodeFunc?(hexData: Uint, returnLength: boolean): any;
    encodeFunc?(forHash: boolean): Uint;
}

export interface HexDataType {
    defaultLength?: number;
    lengthBefore?: boolean;
    encode?(v: any): Uint;
    parse?(v: Uint): any;
}
*/


export class ObjectEncoding {

    private static initialized = false; 

    //private static readonly types: Dict<HexDataType> = {};

    public static init() {
        if (this.initialized) return;
        //this.setupTypes();
        this.initialized = true;
    }
    
    /*private static setupTypes() {

        this.types.index =
        this.types.slotIndex =
        this.types.nonce =
        this.types.timestamp =
        this.types.bigint = {
            defaultLength: 1,
            lengthBefore: true,
            encode: (v: any) => Uint64.prototype.toShortUint.call(v),
            parse: (v: any) => Uint64.create(v)
        };

        this.types.bool = {
            defaultLength: 1,
            encode: (v: any) => (v ? Uint8.from(1) : Uint8.from(0)),
            parse: (v: Uint8) => (v.eq(1))
        };
        
        // this.types.int = {
        //     defaultLength: 1,
        //     lengthBefore: true,
        //     encode: (v: any) => Uint.from(v),
        //     parse: (v: Uint) => v.toInt()
        // }
        // this.types.string = {
        //     encode: (v: string) => Uint.from(v, "utf8"),
        //     parse: (v: Uint) => v.getRaw().toString("utf8"),
        // };

        this.types.default = {};

        this.types.address = { parse: (v: any) => AddressHex.create(v), defaultLength: AddressHex.byteLength };
        this.types.signature = { parse: (v: any) => Signature.create(v), defaultLength: Signature.byteLength };
        this.types.hash = { parse: (v: any) => Uint256.create(v), defaultLength: Uint256.byteLength };
        this.types.version = { parse: (v: any) => PX.create(v), defaultLength: Uint8.byteLength };

    }


    private static encodeValue(value: any, data: EncodingSettings) {

        try {

            let hexDataType: HexDataType;
            let lengthBefore = data.lengthBefore;

            if (!data.type && data.key in this.types) {
                hexDataType = this.types[data.key];
            } else {
                hexDataType = this.types[data.type || "default"] || this.types.default;
            }
            
            if (hexDataType.lengthBefore && !lengthBefore) {
                lengthBefore = hexDataType.lengthBefore;
            }

            let hexValue: Uint;
            if (hexDataType.encode) {
                hexValue = hexDataType.encode(value);
            } else {
                hexValue = value;
            }

            if (lengthBefore) {
                if (lengthBefore === "unlimited") {
                    let hexValueLength = this.encodeLengthForUnlimited(hexValue.getLen());
                    return [hexValueLength, hexValue];
                }

                const lengthBeforeBytesCount = data.length || hexDataType.defaultLength || 1;

                let hexValueLength = Uint.from(hexValue.getLen(), lengthBeforeBytesCount);
                return [hexValueLength, hexValue];
            }

            return [hexValue];

        } catch (err: any) {
            return null;
        }

    }

    private static decodeValue(hexDataSubstring: Uint, data: EncodingSettings) {

        try {

            let hexDataType: HexDataType;

            let lengthBefore = data.lengthBefore;
            
            if (!data.type && data.key in this.types) {
                hexDataType = this.types[data.key];
            } else {
                hexDataType = this.types[data.type || "default"] || this.types.default;
            }

            if (hexDataType.lengthBefore && !lengthBefore) {
                lengthBefore = hexDataType.lengthBefore;
            }
            
            let length = 0;
            
            if (data.length) length = data.length;
            else if (hexDataType.defaultLength) length = hexDataType.defaultLength;
            else if (lengthBefore !== "unlimited") return null;

            let totalLength = length;

            if (lengthBefore) {
                let tmpLength = length;
                if (lengthBefore === "unlimited") {
                    [ length, tmpLength ] = this.decodeLengthFromUnlimited(hexDataSubstring);
                    totalLength = tmpLength;
                } else {
                    length = hexDataSubstring.slice(0, tmpLength).toInt();
                }
                totalLength += length;
                hexDataSubstring = hexDataSubstring.slice(tmpLength);
            }
            
            let hexValue = hexDataSubstring.slice(0, 0 + length);
            if (hexValue.getLen() !== length) {
                return null;
            }
            
            let value: any;
            if (hexDataType.parse) {
                value = hexDataType.parse(hexValue);
            } else {
                value = hexValue;
            }

            return { value, length: totalLength };

        } catch (err: any) {
            return null;
        }

    }*/

    public static encodeLengthForUnlimited(length: number) {
        const lenStr = length.toString(15) + "F";
        return Uint.from((lenStr.length % 2 === 0) ? lenStr : ("0" + lenStr));
    }

    public static decodeLengthFromUnlimited(hexData: Uint) {
        const base15Length = EncodingUtils.splitWithTail(hexData.toHex().toUpperCase(), "F", 1)[0];
        return [
            parseInt(base15Length, 15),
            Math.ceil((base15Length.length + 1) / 2)
        ];
    }
    
    public static encode(object: AnyObj, keyConfigs: DataEncoder[], forHash: boolean) {
        try {
            const hexData: Uint[] = [];

            for (const keyConfig of keyConfigs) {
                if (forHash && keyConfig.hashRemove) continue;

                const value = object[keyConfig.key]
                const rawData = keyConfig.encode(value);

                if (!rawData) {
                    return { cb: CB.ERROR, data: Uint.empty() };
                }

                hexData.push(...rawData);
            }

            return { cb: CB.SUCCESS, data: Uint.concat(hexData) };

        } catch (err: any) {
            return { cb: CB.ERROR, data: Uint.empty() };
        }
    }
    
    public static decode(hexData: Uint, keyConfigs: DataEncoder[], returnLength = false) {
        try {
            const final_data: Dict<any> = {};
            let current_length = 0;
        
            for (const keyConfig of keyConfigs) {
                const currentPart = hexData.slice(current_length);
                const decoded = keyConfig.decode(currentPart);

                if (!decoded) {
                    return { cb: CB.ERROR };
                }

                final_data[keyConfig.key] = decoded.data;
                current_length += decoded.length;
            }
        
            if (returnLength) {
                return { cb: CB.SUCCESS, data: final_data, length: current_length };
            }
        
            return { cb: CB.SUCCESS, data: final_data };

        } catch (err: any) {
            return { cb: CB.ERROR };
        }
    }

}

ObjectEncoding.init();
export default ObjectEncoding;
