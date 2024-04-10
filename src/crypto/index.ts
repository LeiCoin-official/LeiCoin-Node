import crypto from "crypto";
import elliptic from 'elliptic';
import BN from "bn.js"
import EncodingUtils from "../handlers/encodingUtils.js";

interface LeiCoinSignatureAddon { signerType: string; }
export interface LeiCoinBinarySignature extends LeiCoinSignatureAddon, elliptic.ec.Signature { recoveryParam: number; }
export interface LeiCoinSignature extends LeiCoinSignatureAddon { r: string; s: string; recoveryParam: number; }

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
        try {
            const keyPair = this.ec.keyFromPrivate(privateKey, "hex");
            const signature = keyPair.sign(hashData);
            return signature;   
        } catch (error: any) {
            return false;
        }
    }

    public static async getAddress(hashData: Buffer, signatureHex: string) {
        try {
            const signature = EncodingUtils.decodeSignature(signatureHex);
            const key =  this.ec.recoverPubKey(hashData, signature, signature.recoveryParam);   
        } catch (error: any) {
            return false;
        }
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
