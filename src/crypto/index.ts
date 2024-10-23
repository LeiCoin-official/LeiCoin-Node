import crypto from "crypto";
import { type curve, ec as ellipticCurve } from 'elliptic';
import { Uint, Uint256 } from "low-level";
import { Signature } from "./signature.js";
import { KeyPair, PrivateKey, PublicKey, PublicKeyPair, SharedSecret } from "./cryptoKeys.js";
import { PX } from "../objects/prefix.js";

export class LCrypt {

    static readonly ec = new ellipticCurve("secp256k1");

    static sha256(input: Uint | Buffer) {
        return new Uint256(
            crypto.createHash('sha256').update(
                input instanceof Uint ? input.getRaw() : input
            ).digest()
        );
    }

    static sign(hash: Uint256, signerType: PX, privateKey: PrivateKey) {
        try {
            const keyPair = KeyPair.fromPrivate(privateKey);
            const signature = keyPair.sign(hash);
            return Signature.fromElliptic(signerType, signature);
        } catch (error: any) {
            return Signature.alloc();
        }
    }

     static getPublicKeyFromPrivateKey(privateKey: PrivateKey) {
        try {
            return KeyPair.fromPrivate(privateKey).getPublic();
        } catch (error: any) {
            return PublicKey.empty();
        }
    }

    static getPublicKeyFromSignature(hash: Uint256, signature: Signature) {
        try {
            return PublicKey.from((this.ec.recoverPubKey(
                hash.getRaw(),
                signature.getElliptic(),
                signature.getRecoveryParam()
            ) as curve.base.BasePoint).encode("array", true));
        } catch (error: any) {
            return PublicKey.empty();
        }
    }

    static randomBytes(length: number) {
        return crypto.randomBytes(length);
    }

    static generatePrivateKey() {
        return new PrivateKey(this.ec.genKeyPair().getPrivate().toBuffer());
    }


    static genPrivateKeyFromPasswd(passwd: string) {
        return new PrivateKey(crypto.pbkdf2Sync(
            passwd,
            this.sha256(Uint.from(passwd, "utf8")).getRaw(),
            100000,
            32,
            'sha256'
        ));
    }

    static createSharedSecret(privateKey: PrivateKey, publicKey: PublicKey) {
        const sourceKeyPair = KeyPair.fromPrivate(privateKey);
        const destKeyPair = PublicKeyPair.fromPublic(publicKey);
        return sourceKeyPair.derive(destKeyPair.getPublic());
    }

    static encryptData(data: Uint, sharedSecret: Uint256, algorithm = "aes-256-gcm") {
        const iv = this.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, sharedSecret.getRaw(), iv);
        const encrypted = Uint.concat([
            cipher.update(data.getRaw()),
            cipher.final()
        ]);
        return Uint.concat([iv, encrypted]);
    }

    static decryptData(data: Uint, sharedSecret: Uint256, algorithm = "aes-256-gcm") {
        const iv = data.slice(0, 16);
        const encrypted = data.slice(16);
        const decipher = crypto.createDecipheriv(algorithm, sharedSecret.getRaw(), iv.getRaw());
        return Uint.concat([decipher.update(encrypted.getRaw()), decipher.final()]);
    }

}

export default LCrypt;
