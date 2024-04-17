import Crypto from "../crypto/index.js";
import EncodingUtils from "../handlers/encodingUtils.js";

export class Address {

    public static getType(addressWithPrefix: string) {
        return addressWithPrefix.slice(2, addressWithPrefix.length).replace("x", "0").substring(0, 2);
    }

    public static encodeToHex(address: string) {
        /*if (address.toLowerCase().startsWith("lc")) {
            return address.slice(2, address.length).replace("x", "0");
        }
        return address.replace("x", "0");*/
        return address.slice(2, address.length).replace("x", "0");
    }
    
    public static fromDecodedHex(hexKey: string) {
        const splitetHexKey = hexKey.split("");
    
        splitetHexKey[1] = splitetHexKey[1].replace("0", "x");
        const address = "lc" + splitetHexKey.join("");
        return address;
    }

    public static fromPublicKey(addressType: string, publicKey: string) {
        const address = this.fromDecodedHex(addressType) + Crypto.sha256(publicKey).substring(0, 40);
        return address;
    }

    public static fromPrivateKey(addressType: string, privateKey: string) {
        return this.fromPublicKey(addressType, Crypto.getPublicKeyFromPrivateKey(privateKey));
    }

    public static fromSignature(hashData: Buffer, signatureHex: string) {
        const signature = EncodingUtils.decodeSignature(signatureHex);
        const publicKey = Crypto.getPublicKeyFromSignature(hashData, signature);
        return this.fromPublicKey(signature.signerType, publicKey);
    }

}

export default Address;