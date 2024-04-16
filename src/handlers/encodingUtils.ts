import { Callbacks } from "../utils/callbacks.js";
import type { LeiCoinBinarySignature, LeiCoinSignature } from "../crypto/index.js";
import Address from "../objects/address.js";
import { AnyObj, Dict } from "../utils/objects.js";
import BigNum from "../utils/bigNum.js";

type BasicTypes = "string" | "int" | "bigint" | "array" | "bool" | "object" | "bigintWithLenPrefix";
type AdvancedTypes = "address" | "hash" | "signature" | "nonce" | "version";
type DefaultDataTypes = BasicTypes | AdvancedTypes;

interface DataFromHexArguments {
    key: string;
    length?: number;
    lengthBefore?: boolean;
    type?: DefaultDataTypes;
    decodeFunc?(hexData: string, returnLength: boolean): any;
}

interface DataToHexArguments {
    key: string;
    lengthBefore?: boolean;
    type?: DefaultDataTypes;
    encodeFunc?(add_empty_bytes: boolean, forHash: boolean): string;
}

interface HexDataType {
    defaultLength?: number;
    lengthBefore?: boolean;
    encode?(value: any): string;
    parse?(value: string): any;
}

type HexDataTypes = Dict<HexDataType>;

export default class EncodingUtils {

    public static splitWithTail(str: string, delim: string, count: number) {
        var parts = str.split(delim);
        var tail = parts.slice(count).join(delim);
        var result = parts.slice(0,count);
        result.push(tail);
        return result;
    }
    
    public static encodeBase64ToString(data: string) {
        return Buffer.from(data).toString("base64");
    }
    
    public static encodeBase64ToBuffer(data: string) {
        return Buffer.from(data, 'base64');
    }
    
    public static decodeBase64ToString(data: string) {
        return Buffer.from(data, 'base64').toString();
    }
    
    public static encodeStringToHex(stringData: string) {
        return Buffer.from(stringData).toString("hex");
    }
      
    public static decodeHexToString(hexData: string) {
        return Buffer.from(hexData, "hex").toString();
    }
    
    public static hexToBuffer(hexData: string) {
        return Buffer.from(hexData, "hex");
    }

    public static bufferToHex(buffer: Buffer) {
        return buffer.toString("hex");
    }
    
    public static encodePublicKeyToBase64(public_key_pem: string) {
        return this.encodeBase64ToString(public_key_pem);
    }
    
    public static decodeBase64ToPublicKey(encoded_public_key: string) {
        return this.decodeBase64ToString(encoded_public_key);
    }
    
    
    /*public static compressZeros(numberStr: string) {
        // Define a regular expression pattern to match consecutive zeros
        const pattern = /0{3,9}/g; // Matches 4 or more consecutive zeros globally
    
        // Replace matches with E(number of zeros)
        const convertedStr = numberStr.replace(pattern, function(match) {
            return 'E' + match.length;
        });
    
        return convertedStr;
    }
    
    public static decompressZeros(compressedStr: string) {
        // Define a regular expression pattern to match compressed sequences
        var pattern = /E(\d+)/g; // Matches E followed by one or more digits
    
        // Replace matches with the corresponding number of zeros
        var decompressedStr = compressedStr.replace(pattern, function(match, numZeros) {
            return '0'.repeat(parseInt(numZeros));
        });
    
        return decompressedStr;
    }*/

    public static encodeSignature(signerType = "00", signature: LeiCoinBinarySignature) {
        return (
            signerType +
            signature.r.toString("hex").padStart(64, "0") +
            signature.s.toString("hex").padStart(64, "0") +
            signature.recoveryParam.toString(16).padStart(2, "0")
        );
    }
    
    public static decodeSignature(hexData: string): LeiCoinSignature {
        return {
            signerType: hexData.substring(0, 2),
            r: hexData.substring(2, 66),
            s: hexData.substring(66, 130),
            recoveryParam: parseInt(hexData.substring(130, 132), 16)
        };
    }

    private static hexDataBasicTypes: Dict<HexDataType> = {
        bigint: {
            encode: BigNum.numToHex, parse: BigNum.hexToNum
        },
        bool: {
            defaultLength: 1,
            encode: (value: any) => (value ? "1" : "0"),
            parse: (value: string) => (value === "1")
        },
        default: {}
    }

    private static hexDataTemplateTypes: HexDataTypes = {
        bigintWithLenPrefix: {
            defaultLength: 2, lengthBefore: true,
            ...this.hexDataBasicTypes.bigint
        }
    }

    private static hexDataAdvancedTypes: HexDataTypes = {
        address: { defaultLength: 40, encode: Address.encodeToHex, parse: Address.fromDecodedHex },
        signature: { defaultLength: 132 },
        hash: { defaultLength: 64 },
        nonce: this.hexDataTemplateTypes.bigintWithLenPrefix,
        index: this.hexDataTemplateTypes.bigintWithLenPrefix,
        timestamp: this.hexDataTemplateTypes.bigintWithLenPrefix,
        version: { defaultLength: 2 }
    }

    private static hexDataTypes: HexDataTypes = {
        ...this.hexDataBasicTypes,
        ...this.hexDataTemplateTypes,
        ...this.hexDataAdvancedTypes
    }

    private static encodeValueToHex(value: any, data: DataToHexArguments) {

        let hexDataType: HexDataType;
        let lengthBefore = data.lengthBefore;

        if (data.key in this.hexDataTypes) {

            hexDataType = this.hexDataTypes[data.key];

        } else {
            hexDataType = this.hexDataTypes[data.type || "default"] || this.hexDataTypes.default;
        }
        
        if (hexDataType.lengthBefore && !lengthBefore) {
            lengthBefore = hexDataType.lengthBefore;
        }

        let hexValue: string;
        if (hexDataType.encode) {
            hexValue = hexDataType.encode(value);
        } else {
            hexValue = value;
        }

        if (lengthBefore) {
            let hexValueLength = BigNum.numToHex(hexValue.length);
            return hexValueLength + hexValue;
        }

        return hexValue;

    }

    private static getValueFromHex(hexDataSubstring: string, data: DataFromHexArguments) {

        let hexDataType: HexDataType;

        let lengthBefore = data.lengthBefore;
        
        if (data.key in this.hexDataAdvancedTypes) {

            hexDataType = this.hexDataTypes[data.key];

        } else {
            hexDataType = this.hexDataTypes[data.type || "default"] || this.hexDataTypes.default;
        }

        if (hexDataType.lengthBefore && !lengthBefore) {
            lengthBefore = hexDataType.lengthBefore;
        }
        
        let length: number;

        if (data.length) length = data.length;
        else if (hexDataType.defaultLength) length = hexDataType.defaultLength;
        else if (lengthBefore) length = 2;
        else return null;

        let totalLength = length;

        if (lengthBefore) {
            const tmpLength = length;
            length = parseInt(hexDataSubstring.substring(0, tmpLength), 16);
            totalLength += length;
            hexDataSubstring = hexDataSubstring.substring(tmpLength);
        }
        
        let hexValue = hexDataSubstring.substring(0, 0 + length);
        if (hexValue.length !== length) {
            return null;
        }
        
        let value: any;
        if (hexDataType.parse) {
            value = hexDataType.parse(hexValue);
        } else {
            value = hexValue;
        }

        return { value, length: totalLength };

    }

    public static encodeObjectToHex(object: AnyObj, keys: (DataToHexArguments | null)[], add_empty_bytes: boolean) {

        try {

            let hexData = "";

            for (const data of keys) {

                if (!data) continue;

                const value = object[data.key];

                if (data.type === "object" && data.encodeFunc) {

                    hexData += data.encodeFunc.call(value, false, false);

                } else if (data.type === "array" && data.encodeFunc) {

                    hexData += BigNum.numToHex(value.length);

                    for (let item of value) {
                        hexData += data.encodeFunc.call(item, false, false);
                    }

                } else {
                    const hexValue = this.encodeValueToHex(value, data);

                    if (!hexValue) {
                        return { cb: Callbacks.ERROR, data: "" };
                    }

                    hexData += hexValue;
                }
            }

            const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
            const finalHexData = hexData + empty_bytes;

            return { cb: Callbacks.SUCCESS, data: finalHexData };

        } catch (err: any) {
            return { cb: Callbacks.ERROR, data: "" };
        }

    }
    
    public static getObjectFromHex(hexData: string, values: DataFromHexArguments[], returnLength = false) {
        
        try {

            const final_data: Dict<any> = {};
            let current_length = 0;
        
            for (const data of values) {
        
                const key = data.key;
                
                if (data.type === "object" && data.decodeFunc) {

                    const rawObj = hexData.substring(current_length, hexData.length);
                    const object = data.decodeFunc(rawObj, true);
                    final_data[key] = object.data;
                    current_length += object.length;

                } else if (data.type === "array" && data.decodeFunc) {
        
                    const final_array = [];

                    const lenghValueLen = data.length as number;
                    
                    const arrayDataWithLength = hexData.substring(current_length, hexData.length);
                    const arrayDataHexLength = arrayDataWithLength.substring(0, lenghValueLen)
                    const length = parseInt(`0x${arrayDataHexLength}`);
            
                    let arrayData = arrayDataWithLength.substring(lenghValueLen, arrayDataWithLength.length);
        
                    let total_arrayLength = arrayDataHexLength.length;
                        
                    for (let i = 0; i < length; i++) {
            
                        const array_item = data.decodeFunc(arrayData, true);
                        final_array.push(array_item.data);
                        arrayData = arrayData.substring(array_item.length);
                        total_arrayLength += array_item.length;
        
                    }
        
                    current_length += total_arrayLength;
                    final_data[key] = final_array;
        
                } else {
                    
                    const value = this.getValueFromHex(hexData.substring(current_length, hexData.length), data);

                    if (!value) {
                        return { cb: Callbacks.ERROR };
                    }
                    
                    final_data[key] = value.value;
                    current_length += value.length;
                }
            }
        
            if (returnLength) {
                return { cb: Callbacks.SUCCESS, data: final_data, length: current_length };
            }
        
            return { cb: Callbacks.SUCCESS, data: final_data };

        } catch (err: any) {
            return { cb: Callbacks.ERROR };
        }
    
    }
}