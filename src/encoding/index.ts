
export class EncodingUtils {

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

}

export default EncodingUtils;
