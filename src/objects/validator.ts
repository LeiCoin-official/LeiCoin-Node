import ObjectEncoding from "../encoding/objects.js";
import { NumberLike, Uint, Uint64 } from "../utils/binary.js";
import cli from "../utils/cli.js";
import { AddressHex } from "./address.js";
import { Prefix } from "./prefix.js";

export class Validator {

    public address: AddressHex;
    private stake: Uint64;
    public version: Prefix;

    constructor(address: AddressHex, stake: Uint64, version = Prefix.from(0)) {
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

    public encodeToHex() {
    
        const resultData = ObjectEncoding.encode(this, [
            {key: "version"},
            {key: "stake", type: "bigint"},
        ]);

        return resultData.data;
    
    }

    public static fromDecodedHex(address: AddressHex, hexData: Uint) {

        try {

            const resultData = ObjectEncoding.decode(hexData, [
                {key: "version"},
                {key: "stake", type: "bigint"},
            ]);

            const data = resultData.data;
        
            if (data && data.version.eq(0)) {
                return new Validator(address, data.stake, data.version);
            }

        } catch (err: any) {
            cli.data_message.error(`Error loading Validator from Decoded Hex: ${err.message}`);
        }
        
        return null;
    }

}

export default Validator;
