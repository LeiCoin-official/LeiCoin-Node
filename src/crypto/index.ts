import crypto from "crypto";
import elliptic from 'elliptic';
import EncodingUtils from "../handlers/encodingUtils.js";
import { Dict } from "../utils/objects.js";

export interface LeiCoinBinarySignature extends elliptic.ec.Signature { recoveryParam: number; }
export interface LeiCoinSignature {
    signerType: string;
    r: string;
    s: string;
    recoveryParam: number;
}

export class Crypto {

    public static readonly ec = new elliptic.ec("secp256k1");

    public static sha256(rawData: string | Dict<any>, excludedKeys?: string[], outputType?: "string"): string;
    public static sha256(rawData: string | Dict<any>, excludedKeys?: string[], outputType?: "buffer"): Buffer;
    public static sha256(rawData: string | Dict<any>, excludedKeys: string[] = [], outputType: "string" | "buffer" = "string") {
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

    public static sign(hashData: Buffer, signerType: string, privateKey: string) {
        try {
            const keyPair = this.ec.keyFromPrivate(privateKey, "hex");
            const signature = keyPair.sign(hashData);
            //return EncodingUtils.encodeSignature(signerType, (signature as LeiCoinBinarySignature));
            const encoded = EncodingUtils.encodeSignature(signerType, (signature as LeiCoinBinarySignature));
            return encoded;
        } catch (error: any) {
            return "";
        }
    }

    public static getPublicKeyFromPrivateKey(privateKey: string) {
        try {
            return this.ec.keyFromPrivate(privateKey, "hex").getPublic("hex");
        } catch (error: any) {
            return "";
        }
    }

    public static getPublicKeyFromSignature(hashData: Buffer, signature: LeiCoinSignature){
        try {
            return this.ec.recoverPubKey(hashData, signature, signature.recoveryParam).encode("hex") as string;
        } catch (error: any) {
            return "";
        }
    }

    public static getPreparedObjectForHashing(obj: Dict<any>, excludedKeys: string[] = []): Dict<any> {
        const deepSort = (input: any): any => {
            if (typeof input !== 'object' || input === null) {
                return input;
            }

            if (Array.isArray(input)) {
                return input.map(deepSort);
            }

            const sortedObj: Dict<any> = {};
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
