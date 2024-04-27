import crypto from "crypto";
import elliptic from 'elliptic';
import { Dict } from "../utils/objects.js";
import { Uint, Uint256, Uint8 } from "../utils/binary.js";
import { EllipticBinarySignature, RawSignature } from "../objects/signature.js";
import { PrivateKey, PublicKey } from "../objects/cryptoKeys.js";

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

    public static sign(hash: Uint256, signerType: Uint8, privateKey: PrivateKey) {
        try {
            const keyPair = this.ec.keyFromPrivate(privateKey.getRaw(), "hex");
            const signature = keyPair.sign(hash.getRaw());
            return RawSignature.fromElliptic(signerType, (signature as EllipticBinarySignature));
        } catch (error: any) {
            return RawSignature.alloc();
        }
    }

    public static getPublicKeyFromPrivateKey(privateKey: PrivateKey) {
        try {
            return PrivateKey.from(this.ec.keyFromPrivate(privateKey.getRaw(), "hex").getPublic("array"));
        } catch (error: any) {
            return PrivateKey.alloc();
        }
    }

    public static getPublicKeyFromSignature(hash: Uint256, signature: RawSignature): Uint {
        try {
            return PublicKey.from(this.ec.recoverPubKey(hash.getRaw(), signature.getElliptic(), signature.getRecoveryParam()).encode("array"));
        } catch (error: any) {
            return PublicKey.alloc(0);
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
