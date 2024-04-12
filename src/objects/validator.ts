import EncodingUtils from "../handlers/encodingUtils.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";

export class Validator {

    public readonly publicKey: string;
    public stake: string;
    public readonly version: string;

    constructor(publicKey: string, stake: string, version = "00") {
        this.publicKey = publicKey;
        this.stake = stake;
        this.version = version;
    }

    public encodeToHex(add_empty_bytes = true) {
    
        const encoded_stake = BigNum.numToHex(this.stake.toString());
        const stake_length = BigNum.numToHex(encoded_stake.length);

        const hexData = this.version + 
                        stake_length + 
                        encoded_stake;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;
    
    }

    public static fromDecodedHex(publicKey: string, hexData: string) {

        try {

            const resultData = EncodingUtils.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "stake_length", length: 2, type: "int"},
                {key: "stake", length: "stake_length", type: "bigint"},
            ]);

            const data = resultData.data;
        
            if (data && data.version === "00") {
                return new Validator(publicKey, data.stake, data.version);
            }

        } catch (err: any) {
            cli.data_message.error(`Error loading Validator from Decoded Hex: ${err.message}`);
        }
        
        return null;
    }

}

export default Validator;
