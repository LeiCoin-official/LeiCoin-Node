import crypto from "crypto";
import elliptic from 'elliptic';
import { Dict } from "../utils/objects.js";
import { Uint, Uint256 } from "../utils/binary.js";
import { EllipticBinarySignature, Signature } from "../objects/signature.js";
import { PrivateKey, PublicKey } from "./cryptoKeys.js";
import { PX } from "../objects/prefix.js";

export class Crypto {

    public static readonly ec = new elliptic.ec("secp256k1");

    public static sha256(input: Uint | Buffer): Uint256;
    public static sha256(input: Uint & Buffer) {
        return new Uint256(
            crypto.createHash('sha256').update(
                input.getRaw ? input.getRaw() : input
            ).digest()
        );
    }

    public static sign(hash: Uint256, signerType: PX, privateKey: PrivateKey) {
        try {
            const keyPair = this.ec.keyFromPrivate(privateKey.getRaw(), "hex");
            const signature = keyPair.sign(hash.getRaw());
            return Signature.fromElliptic(signerType, (signature as EllipticBinarySignature));
        } catch (error: any) {
            return Signature.alloc();
        }
    }

    public static getPublicKeyFromPrivateKey(privateKey: PrivateKey) {
        try {
            return PublicKey.from(this.ec.keyFromPrivate(privateKey.getRaw(), "hex").getPublic("array"));
        } catch (error: any) {
            return PublicKey.empty();
        }
    }

    public static getPublicKeyFromSignature(hash: Uint256, signature: Signature): Uint {
        try {
            return PublicKey.from(this.ec.recoverPubKey(
                hash.getRaw(),
                signature.getElliptic(),
                signature.getRecoveryParam()
            ).encode("array"));
        } catch (error: any) {
            return PublicKey.empty();
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
