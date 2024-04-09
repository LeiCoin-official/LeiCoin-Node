import crypto from "crypto";
import elliptic from 'elliptic';
import BN from "bn.js"

export interface SignatureWithRecovery extends elliptic.ec.Signature {
    r: BN;
    s: BN;
    recoveryParam: number;
}

export class Crypto {

    public static readonly ec = new elliptic.ec("secp256k1");

    public static sha256(rawData: string | { [key: string]: any }, excludedKeys: string[] = []) {
        let data = "";

        if (typeof(rawData) === "object") {
            data = JSON.stringify(this.getPreparedObjectForHashing(rawData, excludedKeys))
        } else {
            data = rawData;
        }

        return crypto.createHash('sha256').update(data).digest('hex');
    }

    public static async sign(hashData: Buffer, privateKey: string) {
        const keyPair = this.ec.keyFromPrivate(privateKey, "hex");
        return keyPair.sign(hashData);
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

export default Crypto;
