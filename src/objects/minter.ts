import ObjectEncoding from "../encoding/objects.js";
import { NumberLike, Uint, Uint64 } from "../binary/uint.js";
import cli from "../cli/cli.js";
import { AddressHex } from "./address.js";
import { PX } from "./prefix.js";
import { PrivateKey } from "../crypto/cryptoKeys.js";
import { BE, DataEncoder } from "../encoding/binaryEncoders.js";

export class Minter {

    public readonly address: AddressHex;
    private readonly stake: Uint64;
    public readonly version: PX;

    constructor(address: AddressHex, stake: Uint64, version = PX.V_00) {
        this.address = address;
        this.stake = stake.clone();
        this.version = version;
    }

    public getStake() {
        return this.stake;
    }

    public addRewardStake(amount: NumberLike) {
        this.stake.iadd(amount);
    }

    public encodeToHex() {
        return ObjectEncoding.encode(this, Minter.encodingSettings, false).data;
    }

    public static fromDecodedHex(address: AddressHex, hexData: Uint) {
        try {
            const resultData = ObjectEncoding.decode(hexData, Minter.encodingSettings);
            const data = resultData.data;
        
            if (data && data.version.eq(0)) {
                return new Minter(address, data.stake, data.version);
            }
        } catch (err: any) {
            cli.data.error(`Error loading Minter from Decoded Hex: ${err.stack}`);
        }
        return null;
    }

    private static encodingSettings: DataEncoder[] = [
        BE.PX("version"),
        //{key: "address"},
        BE.BigInt("stake")
    ]

}

export class MinterCredentials {

	public readonly privateKey: PrivateKey;
	public readonly address: AddressHex;

    constructor(privateKey: PrivateKey, address: AddressHex) {
        this.privateKey = privateKey;
        this.address = address;
    }

}

export default Minter;
