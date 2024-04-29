import EncodingUtils from "../handlers/encodingUtils.js";
import { NumberLike, Uint, Uint64, Uint8 } from "../utils/binary.js";
import cli from "../utils/cli.js";
import { AddressHex } from "./address.js";

export class Validator {

    public address: AddressHex;
    private stake: Uint64;
    public version: Uint8;

    constructor(address: AddressHex, stake: Uint64, version = Uint8.alloc()) {
        this.address = address;
        this.stake = stake;
        this.version = version;
    }

    public getStake() {
        return this.stake;
    }

    public addRewardStake(amount: NumberLike) {
        this.stake.add(amount);
    }

    //public 

    public encodeToHex(add_empty_bytes = true) {
    
        const resultData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "stake", type: "bigintWithLenPrefix"},
        ], add_empty_bytes);

        return resultData.data;
    
    }

    public static fromDecodedHex(address: AddressHex, hexData: string) {

        try {

            const resultData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "stake", type: "bigintWithLenPrefix"},
            ]);

            const data = resultData.data;
        
            if (data && data.version === "00") {
                return new Validator(address, data.stake, data.version);
            }

        } catch (err: any) {
            cli.data_message.error(`Error loading Validator from Decoded Hex: ${err.message}`);
        }
        
        return null;
    }

}

export default Validator;
