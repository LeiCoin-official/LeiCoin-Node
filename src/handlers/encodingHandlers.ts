import { buffer } from "stream/consumers";
import { Callbacks } from "../utils/callbacks";

export default class EncodingUtils {

    public static splitWithTail(str: string, delim: string, count: number){
        var parts = str.split(delim);
        var tail = parts.slice(count).join(delim);
        var result = parts.slice(0,count);
        result.push(tail);
        return result;
    }
    
    public static base64EncodeToString(data: string) {
        return Buffer.from(data).toString('base64');
    }
    
    public static base64EncodeToBuffer(data: string) {
        return Buffer.from(data, 'base64');
    }
    
    public static base64DecodeToString(data: string) {
        return Buffer.from(data, 'base64').toString();
    }
    
    public static stringToHex(stringData: string) {
        return Buffer.from(stringData).toString("hex");
    }
      
    public static hexToString(hexData: string) {
        return Buffer.from(hexData, "hex").toString();
    }
    
    public static base64ToHex(base64String: string) {
        return Buffer.from(base64String, 'base64').toString('hex');
    }
    
    public static hexToBase64(hexString: string) {
        return Buffer.from(hexString, 'hex').toString('base64');
    }
    
    /*public static hexToBinary(hexData: string) {
        return Buffer.from(hexData, "hex");
    }

    public static binaryToHex(buffer: Buffer) {
        return buffer.toString("hex");
    }*/
    
    public static encodePublicKeyToEncodedPublicKey(public_key_pem: string) {
        return this.base64EncodeToString(public_key_pem);
    }
    
    public static decodeEncodedPublicKeyToPublicKey(encoded_public_key: string) {
        return this.base64DecodeToString(encoded_public_key);
    }
    
    
    public static compressZeros(numberStr: string) {
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
    }
    
    public static encodeAddressToHex(address: string) {
        return address.slice(2, address.length).replace("x", "0");
    }
    
    public static decodeHexToAddress(hexKey: string) {
        const splitetHexKey = hexKey.split("");
    
        splitetHexKey[1] = splitetHexKey[1].replace("0", "x");
        const address = "lc" + splitetHexKey.join("");
        return address;
    }
    
    public static splitHex(hexData: string, values: { key: string, length: number | string, type?: "string" | "int" | "bigint" | "array", decode?: boolean, arrayFunc?: (hexData: string, returnLength: boolean) => any }[], returnLength = false) {
        
        const final_data: {[key: string]: any} = {};
        let current_length = 0;
    
        for (const data of values) {
    
            const key = data.key;
    
            if (data.type !== "array") {
    
                let length: number;
                const type = data.type;
    
                if (typeof(data.length) === "string") {
                    length = parseInt(final_data[data.length]);
                } else {
                    length = data.length;
                }
                
                let value = hexData.substring(current_length, current_length + length);
                if (value.length !== length) {
                    return { cb: Callbacks.NONE };
                }
        
                if (data.decode) {
                    value = this.hexToString(value);
                }
        
                if (type === "int") {
                    final_data[key] = parseInt(value);
                } else if (type === "bigint") {
                    final_data[key] = BigInt(value);
                } else {
                    final_data[key] = value;
                }
        
                current_length += length;
    
            } else if (data.arrayFunc) {
    
                const final_array = [];
    
                let total_arrayLength = 0;
    
                try {
                
                    const arrayDataWithLength = this.splitWithTail(hexData.substring(current_length, hexData.length), "E", 1);
                    const length = parseInt(arrayDataWithLength[0]);
        
                    let arrayData = arrayDataWithLength[1];
    
                    total_arrayLength = arrayDataWithLength[0].length + 1;
                    
                    for (let i = 0; i < length; i++) {
        
                        const array_item = data.arrayFunc(arrayData, true);
        
                        final_array.push(array_item.data);
                        
                        arrayData = arrayData.substring(array_item.length);
    
                        total_arrayLength += array_item.length;
    
                    }
    
                } catch {}
    
                current_length += total_arrayLength;
    
                final_data[key] = final_array;
    
            }
    
        }
    
        if (returnLength) {
            return { cb: Callbacks.SUCCESS, data: final_data, lengh: current_length };
        }
    
        return { cb: Callbacks.SUCCESS, data: final_data };
    
    }
}