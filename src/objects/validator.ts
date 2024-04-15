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
    
        const resultData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "stake", type: "bigintWithLenPrefix"},
        ], add_empty_bytes);

        return resultData.data;
    
    }

    public static fromDecodedHex(publicKey: string, hexData: string) {

        try {

            const resultData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "stake", type: "bigintWithLenPrefix"},
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
