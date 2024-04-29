import { Uint, Uint64, Uint8 } from "../utils/binary.js";
import { Callbacks } from "../utils/callbacks.js";
import { AnyObj, Dict } from "../utils/objects.js";


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

    /*public static encodeSignature(signerType = "00", signature: LeiCoinBinarySignature) {
        return (
            signerType +
            signature.r.toString("hex", 64) +
            signature.s.toString("hex", 64) +
            signature.recoveryParam.toString(16).padStart(2, "0")
        );
    }
    
    public static decodeSignature(hexData: RawSignature): LeiCoinSignature {
        return {
            signerType: hexData.slice(0, 2),
            r: hexData.slice(2, 66),
            s: hexData.slice(66, 130),
            recoveryParam: parseInt(hexData.slice(130, 132), 16)
        };
    }*/


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
            let hexValueLength = hexValue.getLen("uint");
            return [hexValueLength, hexValue];
        }

        return [hexValue];

    }

    private static getValueFromHex(hexDataSubstring: Uint, data: DataFromHexArguments) {

        try {

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
            
            let length = 0;
            
            if (data.length) length = data.length;
            else if (hexDataType.defaultLength) length = hexDataType.defaultLength;
            else if (!lengthBefore) return null;

            let totalLength = length;

            if (lengthBefore) {
                let tmpLength = length;
                if (lengthBefore === "unlimited") {
                    [ length, tmpLength ] = this.getLengthFromUnlimited(hexDataSubstring);
                    totalLength = tmpLength;
                } else {
                    length = hexDataSubstring.slice(0, tmpLength).toInt();
                }
                totalLength += length;
                hexDataSubstring = hexDataSubstring.slice(tmpLength);
            }
            
            let hexValue = hexDataSubstring.slice(0, 0 + length);
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

        } catch (err: any) {
            return null;
        }

    }

    public static encodeLengthForUnlimited(length: number) {
        return Uint.from(length.toString(15) + "F");
    }

    public static getLengthFromUnlimited(hexData: Uint) {
        const base15Length = this.splitWithTail(hexData.toHex().toUpperCase(), "F", 1)[0];
        return [
            parseInt(base15Length, 15),
            base15Length.length + 1
        ];
    }

    public static encodeObjectToHex(object: AnyObj, keys: (DataToHexArguments | null)[]) {

        try {

            let hexData: Uint[] = [];

            for (const data of keys) {

                if (!data) continue;

                const value = object[data.key];

                if (data.type === "object" && data.encodeFunc) {

                    hexData.push(data.encodeFunc.call(value, false, false));

                } else if (data.type === "array" && data.encodeFunc) {

                    hexData += BigNum.numToHex(value.length);

                    for (let item of value) {
                        hexData.push(data.encodeFunc.call(item, false, false));
                    }

                } else {
                    const hexValue = this.encodeValueToHex(value, data);

                    if (!hexValue) {
                        return { cb: Callbacks.ERROR, data: Uint.empty() };
                    }

                    hexData.push(...hexValue);
                }
            }

            return { cb: Callbacks.SUCCESS, data: Uint.concat(hexData) };

        } catch (err: any) {
            return { cb: Callbacks.ERROR, data: Uint.empty() };
        }

    }
    
    public static getObjectFromHex(hexData: Uint, values: DataFromHexArguments[], returnLength = false) {
        
        try {

            const final_data: Dict<any> = {};
            let current_length = 0;
        
            for (const data of values) {
        
                const key = data.key;
                
                if (data.type === "object" && data.decodeFunc) {

                    const rawObj = hexData.slice(current_length);
                    const object = data.decodeFunc(rawObj, true);
                    final_data[key] = object.data;
                    current_length += object.length;

                } else if (data.type === "array" && data.decodeFunc) {
        
                    const final_array = [];

                    const arrayDataWithLength = hexData.slice(current_length);

                    let lenghValueLen: number;
                    let arrayCount: number;

                    if (data.length) {
                        lenghValueLen = data.length;
                        arrayCount = arrayDataWithLength.slice(0, lenghValueLen).toInt();
                    } else if (data.lengthBefore === "unlimited") {
                        [arrayCount, lenghValueLen] = this.getLengthFromUnlimited(arrayDataWithLength);
                    } else {
                        return { cb: Callbacks.ERROR };
                    }

                    //let arrayData = arrayDataWithLength.slice(lenghValueLen, arrayDataWithLength.length);
                    let arrayData = arrayDataWithLength.slice(lenghValueLen);
                    let total_arrayLength = lenghValueLen;
                        
                    for (let i = 0; i < arrayCount; i++) {
            
                        const array_item = data.decodeFunc(arrayData, true);
                        final_array.push(array_item.data);
                        arrayData = arrayData.slice(array_item.length);
                        total_arrayLength += array_item.length;
        
                    }
        
                    current_length += total_arrayLength;
                    final_data[key] = final_array;
        
                } else {
                    
                    const value = this.getValueFromHex(hexData.slice(current_length), data);

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