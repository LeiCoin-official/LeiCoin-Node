import Crypto from "../crypto/index.js";
import EncodingUtils from "../handlers/encodingUtils.js";

export class AddressHex {

    public static getType(addressHex: string) {
        return addressHex.slice(0, 2);
    }

    public static fromPublicKey(addressType: string, publicKey: string) {
        return addressType + Crypto.sha256(publicKey).slice(0, 40);
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

export class Address32 {

    private static address32Chars = '123456789abcdefghjklmnpqrstuvwyz';

    public static getType(address32: string) {
        return address32.slice(2, 4);
    }

    public static toAddressHex(address32: string) {

        const address32Data = "2" + address32.slice(4).toLowerCase();
        let decimalValue = 0n;
        for (let i = 0; i < address32Data.length; i++) {
            decimalValue = (decimalValue * 32n) + BigInt(this.address32Chars.indexOf(address32Data[i]));
        }

        return this.getType(address32).replace("x", "0") + decimalValue.toString(16).slice(1);
    }
    
    public static fromAddressHex(addressHex: string) {

        let decimalValue = BigInt('0x1' + addressHex.slice(2));
        let address32 = '';
        while (decimalValue > 0n) {
            address32 = this.address32Chars[Number(decimalValue % 32n)] + address32;
            decimalValue = decimalValue / 32n;
        }

        AddressHex.getType(addressHex).replace("0", "x");
        return "lc" + splitetType.join("") + address32.slice(1);
    }

    public static fromPublicKey(addressType: string, publicKey: string) {
        return this.fromAddressHex(AddressHex.fromPublicKey(addressType, publicKey));
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