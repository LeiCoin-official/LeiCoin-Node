import EncodingUtils from "../handlers/encodingUtils.js";
import Block from "./block.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";
import { AddressHex } from "./address.js";
import DataUtils from "../utils/dataUtils.js";
import { Uint64, Uint, Uint8 } from "../utils/binary.js";
import Signature from "./signature.js";

export class Proposition {
    
    public proposer: AddressHex;
    public nonce: Uint64;
    public signature: Signature;
    public block: Block;
    public version: Uint8;

    constructor(proposer: AddressHex, nonce: Uint64, signature: Signature, block: Block, version = Uint8.alloc()) {
        this.proposer = proposer;
        this.nonce = nonce;
        this.signature = signature;
        this.block = block;
        this.version = version;
    }

    public encodeToHex(add_empty_bytes = true, forHash = false) {

        const returnData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "nonce"},
            (forHash ? null : {key: "signature"}),
            {key: "block", type: "object", encodeFunc: Block.prototype.encodeToHex}
        ], add_empty_bytes);
        
        return returnData.data;

    }

    public static fromDecodedHex(hexData: string, withProposerAddress = true) {

        try {
            const returnData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "nonce"},
                {key: "signature"},
                {key: "block", type: "object", decodeFunc: Block.fromDecodedHex}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {

                data.proposer = "";
                const instance = DataUtils.createInstanceFromJSON(Proposition, data);

                if (withProposerAddress) {
                    instance.proposer = AddressHex.fromSignature(instance.calculateHash(), data.signature);
                }

                return instance;
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Proposition from Decoded Hex: ${err.message}`);
        }

        return null;

    }

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(false, true));
    }

}

export default Proposition;