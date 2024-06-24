import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import { NumberLike, Uint, Uint64 } from "../utils/binary.js";
import cli from "../cli/cli.js";
import { AddressHex } from "./address.js";
import { PX } from "./prefix.js";

export class Validator {

    public address: AddressHex;
    private stake: Uint64;
    public version: PX;

    constructor(address: AddressHex, stake: Uint64, version = PX.V_00) {
        this.address = address;
        this.stake = stake;
        this.version = version;
    }

    public getStake() {
        return this.stake;
    }

    public addRewardStake(amount: NumberLike) {
        this.stake.iadd(amount);
    }

    public encodeToHex() {
        return ObjectEncoding.encode(this, Validator.encodingSettings, false).data;
    }

    public static fromDecodedHex(address: AddressHex, hexData: Uint) {
        try {
            const resultData = ObjectEncoding.decode(hexData, Validator.encodingSettings);
            const data = resultData.data;
        
            if (data && data.version.eq(0)) {
                return new Validator(address, data.stake, data.version);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Validator from Decoded Hex: ${err.message}`);
        }
        return null;
    }

    private static encodingSettings: EncodingSettings[] = [
        {key: "version"},
        //{key: "address"},
        {key: "stake", type: "bigint"},
    ]

}

export default Validator;
