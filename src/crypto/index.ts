import crypto from "crypto";
import elliptic from 'elliptic';
import EncodingUtils from "../handlers/encodingUtils.js";
import { Dict } from "../utils/objects.js";
import { Uint, Uint256 } from "../utils/binary.js";
import Signature from "../objects/signature.js";

export interface LeiCoinBinarySignature extends elliptic.ec.Signature { recoveryParam: number; }
export interface LeiCoinSignature {
    signerType: string;
    r: string;
    s: string;
    recoveryParam: number;
}

export class Crypto {

    public static readonly ec = new elliptic.ec("secp256k1");

    public static sha256(input: string | Uint, outputType?: "binary"): Uint256;
    public static sha256(input: string | Uint, outputType?: "string"): string;
    public static sha256(input: string | Uint, outputType: "string" | "binary" = "binary") {
        if (typeof input === "string") {
            input = Uint256.from(input);
        }
        if (outputType === "string") {
            return crypto.createHash('sha256').update(input.getRaw()).digest("hex");
        }
        return Uint256.from(crypto.createHash('sha256').update(input.getRaw()).digest());
    }

    public static sign(hash: Uint256, signerType: string, privateKey: Uint256) {
        try {
            const keyPair = this.ec.keyFromPrivate(privateKey.getRaw(), "hex");
            const signature = keyPair.sign(hash.getRaw());
            //return EncodingUtils.encodeSignature(signerType, (signature as LeiCoinBinarySignature));
            const encoded = EncodingUtils.encodeSignature(signerType, (signature as LeiCoinBinarySignature));
            return Signature.fromHex(encoded);
        } catch (error: any) {
            return Uint.alloc(0);
        }
    }

    public static getPublicKeyFromPrivateKey(privateKey: Uint256) {
        try {
            return Uint.from(this.ec.keyFromPrivate(privateKey.getRaw(), "hex").getPublic("array"));
        } catch (error: any) {
            return Uint.alloc(0);
        }
    }

    public static getPublicKeyFromSignature(hash: Uint256, signature: LeiCoinSignature): Uint {
        try {
            return this.ec.recoverPubKey(hash.getRaw(), signature, signature.recoveryParam).encode("array");
        } catch (error: any) {
            return Uint.alloc(0);
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
