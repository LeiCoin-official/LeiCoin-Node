import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import { NumberLike, Uint, Uint64 } from "../utils/binary.js";
import cli from "../utils/cli.js";
import DataUtils from "../utils/dataUtils.js";
import { SpecificAddress } from "./address.js";
import { PX } from "./prefix.js";

export class ValidatorAddress extends SpecificAddress {
    public static readonly addressType = PX.A_0c;
    public getType() {
        return PX.A_0c;
    };
}

export class Validator {

    public address: ValidatorAddress;
    private stake: Uint64;
    public version: PX;

    constructor(address: ValidatorAddress, stake: Uint64, version = PX.V_00) {
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

    public static fromDecodedHex(hexData: Uint) {
        try {
            const resultData = ObjectEncoding.decode(hexData, Validator.encodingSettings);
            const data = resultData.data;
        
            if (data && data.version.eq(0)) {
                return DataUtils.createInstanceFromJSON(Validator, data);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Validator from Decoded Hex: ${err.message}`);
        }
        return null;
    }

    private static encodingSettings: EncodingSettings[] = [
        {key: "version"},
        {key: "address", type: "validator_address"},
        {key: "stake", type: "bigint"},
    ]

}

export default Validator;
