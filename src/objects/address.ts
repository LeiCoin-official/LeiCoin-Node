import Crypto from "../crypto/index.js";

export class Address {

    public static getType(addressWithPrefix: string) {
        return addressWithPrefix.slice(2, addressWithPrefix.length).replace("x", "0").substring(0, 2);
    }

    public static encodeToHex(address: string) {
        return address.slice(2, address.length).replace("x", "0");
    }
    
    public static fromDecodedHex(hexKey: string) {
        const splitetHexKey = hexKey.split("");
    
        splitetHexKey[1] = splitetHexKey[1].replace("0", "x");
        const address = "lc" + splitetHexKey.join("");
        return address;
    }

    public static fromPublicKey(addressType: string, publicKey: string) {
        const address = this.fromDecodedHex(addressType) + Crypto.sha256(publicKey).substring(0, 38);
        return address;
    }

}

export default Address;