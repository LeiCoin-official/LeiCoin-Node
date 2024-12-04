
export class EncodingUtils {

    static splitNTimes(str: string, delim: string, count: number) {
        const parts = str.split(delim);
        const tail = parts.slice(count).join(delim);
        const result = parts.slice(0,count);
        if (tail) result.push(tail);
        return result;
    }
    
    static encodeBase64ToString(data: string) {
        return Buffer.from(data).toString("base64");
    }

    static encodeBase64ToBuffer(data: string) {
        return Buffer.from(data, 'base64');
    }
    
    static decodeBase64ToString(data: string) {
        return Buffer.from(data, 'base64').toString();
    }
    
    static encodeStringToHex(stringData: string) {
        return Buffer.from(stringData).toString("hex");
    }
      
    static decodeHexToString(hexData: string) {
        return Buffer.from(hexData, "hex").toString();
    }

}

export default EncodingUtils;
