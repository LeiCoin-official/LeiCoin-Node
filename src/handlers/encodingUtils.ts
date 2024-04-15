import { Callbacks } from "../utils/callbacks.js";
import type { LeiCoinBinarySignature, LeiCoinSignature } from "../crypto/index.js";
import Address from "../objects/address.js";
import { Dict } from "../objects/dictonary.js";

type BasicTypes = "string" | "int" | "bigint" | "array" | "bool" | "object";
type AdvancedTypes = "address" | "hash" | "signature" | "nonce" | "version";
type DefaultDataTypes = BasicTypes | AdvancedTypes;

interface DataFromHexArguments {
    key: string;
    length?: number;
    lengthBefore?: boolean;
    type?: DefaultDataTypes;
    decodeFunc?(hexData: string, returnLength: boolean): any;
}

interface HexDataType {
    defaultLength?: number;
    lengthBefore?: boolean;
    parse?(value: string): any;
}

interface HexDataAdvancedType extends HexDataType {
    extendsType?: string;
}

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
            signature.r.toString("hex") +
            signature.s.toString("hex") +
            signature.recoveryParam.toString(16).padStart(2, "0")
        );
    }
    
    public static decodeSignature(hexData: string) {
        return {
            signerType: hexData.substring(0, 2),
            r: hexData.substring(2, 66),
            s: hexData.substring(66, 130),
            recoveryParam: parseInt(hexData.substring(130, 132), 16)
        };
    }

    private static hexDataAdvancedTypes: Dict<HexDataType> = {
        address: { defaultLength: 40, parse: Address.fromDecodedHex },
        signature: { defaultLength: 128 },
        hash: { defaultLength: 64 },
        nonce: {
            defaultLength: 2, lengthBefore: true,
            parse: (value: string) => BigInt(`0x${value}`).toString()
        },
        index: {
            defaultLength: 2, lengthBefore: true,
            parse: (value: string) => BigInt(`0x${value}`).toString()
        },
        timestamp: {
            defaultLength: 2, lengthBefore: true,
            parse: (value: string) => BigInt(`0x${value}`).toString()
        },
        version: { defaultLength: 2 }
    }

    private static hexDataTypes: Dict<HexDataType> = {
        int: {
            parse: (value: string) => parseInt(`0x${value}`).toString()
        },
        bigint: {
            parse: (value: string) => BigInt(`0x${value}`).toString()
        },
        bool: {
            defaultLength: 1,
            parse: (value: string) => (value === "1")
        },
        ...this.hexDataAdvancedTypes,
        default: {}
    }

    private static getValueFromHex(hexDataSubstring: string, data: DataFromHexArguments) {

        let hexDataType: HexDataType;
        let lengthBefore = data.lengthBefore;

        if (data.key in this.hexDataTypes) {
            hexDataType = this.hexDataTypes[data.key];
            if (hexDataType.lengthBefore && !lengthBefore) {
                lengthBefore = hexDataType.lengthBefore;
            }
        } else {
            hexDataType = this.hexDataTypes[data.type || "default"] || this.hexDataTypes.default;
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
    
    public static getObjectFromHex(hexData: string, values: DataFromHexArguments[], returnLength = false) {
        
        try {

            const final_data: Dict<any> = {};
            let current_length = 0;
        
            for (const data of values) {
        
                const key = data.key;
                
                if (data.type === "object" && data.decodeFunc) {

                    const rawObj = hexData.substring(current_length, hexData.length);
                    const object = data.decodeFunc(rawObj, true);
                    final_data[key] = object;
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
                        return { cb: Callbacks.NONE };
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
            return { cb: Callbacks.NONE };
        }
    
    }
}