import { PrivateKey } from "../crypto/cryptoKeys.js";
import { AddressHex } from "./address.js";

export class Staker {

	public readonly privateKey: PrivateKey;
	public readonly address: AddressHex;

    constructor(privateKey: PrivateKey, address: AddressHex) {
        this.privateKey = privateKey;
        this.address = address;
    }

}

export default Staker;

