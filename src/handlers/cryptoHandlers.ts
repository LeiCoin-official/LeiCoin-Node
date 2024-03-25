import crypto from "crypto";
import * as ed25519 from '@noble/ed25519';

export class CryptoHandlers {

    public static sha256(rawData: string | { [key: string]: any }, excludedKeys: string[] = []) {
        let data = "";

        if (typeof(rawData) === "object") {
            data = JSON.stringify(this.getPreparedObjectForHashing(rawData, excludedKeys))
        } else {
            data = rawData;
        }

        return crypto.createHash('sha256').update(data).digest('hex');
    }

    public static async sign(data: string, privateKey: string) {
        return (await ed25519.signAsync(Buffer.from(data, "hex"), Buffer.from(privateKey, "hex"))).toString();
    }

    public static getPreparedObjectForHashing(obj: { [key: string]: any }, excludedKeys: string[] = []): { [key: string]: any } {
        const deepSort = (input: any): any => {
            if (typeof input !== 'object' || input === null) {
                return input;
            }

            if (Array.isArray(input)) {
                return input.map(deepSort);
            }

            const sortedObj: { [key: string]: any } = {};
            Object.keys(input)
                .sort()
                .forEach(key => {
                    if (!excludedKeys.includes(key)) {
                        sortedObj[key] = deepSort(input[key]);
                    }
                });
            return sortedObj;
        };

        const sortedObj = deepSort(obj);
        return sortedObj;
    }

}

export default CryptoHandlers;
