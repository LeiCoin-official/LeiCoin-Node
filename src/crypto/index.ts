import crypto from "crypto";
import elliptic from 'elliptic';
import EncodingUtils from "../handlers/encodingUtils.js";
import Address from "../objects/address.js";

export interface LeiCoinBinarySignature extends elliptic.ec.Signature { recoveryParam: number; }
export interface LeiCoinSignature {
    signerType: string;
    r: string;
    s: string;
    recoveryParam: number;
}

export class Crypto {

    public static readonly ec = new elliptic.ec("secp256k1");

    public static sha256(rawData: string | { [key: string]: any }, excludedKeys?: string[], outputType?: "string"): string;
    public static sha256(rawData: string | { [key: string]: any }, excludedKeys?: string[], outputType?: "buffer"): Buffer;
    public static sha256(rawData: string | { [key: string]: any }, excludedKeys: string[] = [], outputType: "string" | "buffer" = "string") {
        let data = "";

        if (typeof(rawData) === "object") {
            data = JSON.stringify(this.getPreparedObjectForHashing(rawData, excludedKeys))
        } else {
            data = rawData;
        }

        if (outputType === "string") {
            return crypto.createHash('sha256').update(data).digest("hex");
        }
        return crypto.createHash('sha256').update(data).digest();
    }

    public static async sign(hashData: Buffer, signerType: string, privateKey: string) {
        try {
            const keyPair = this.ec.keyFromPrivate(privateKey, "hex");
            const signature = keyPair.sign(hashData);
            return EncodingUtils.encodeSignature(signerType, (signature as LeiCoinBinarySignature));
        } catch (error: any) {
            return false;
        }
    }

    public static async getAddressFromPrivateKey(type: string, privateKey: string) {
        try {
            const publicKey = this.ec.keyFromPrivate(privateKey, "hex").getPublic("hex");
            return Address.fromPublicKey(type, publicKey);
        } catch (error: any) {
            return false;
        }
    }

    public static async getAddressFromSignature(hashData: Buffer, signatureHex: string) {
        try {
            const signature = EncodingUtils.decodeSignature(signatureHex);
            const publicKey =  this.ec.recoverPubKey(hashData, signature, signature.recoveryParam);
            return Address.fromPublicKey(signature.signerType, publicKey.encode("hex"));
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
