import ObjectEncoding from "../encoding/objects.js";
import Block from "./block.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";
import { AddressHex } from "./address.js";
import DataUtils from "../utils/dataUtils.js";
import { Uint64, Uint } from "../utils/binary.js";
import Signature from "./signature.js";
import { PX } from "./prefix.js";

export class Proposition {
    
    public proposer: AddressHex;
    public nonce: Uint64;
    public signature: Signature;
    public block: Block;
    public version: PX;

    constructor(proposer: AddressHex, nonce: Uint64, signature: Signature, block: Block, version = PX.from(0)) {
        this.proposer = proposer;
        this.nonce = nonce;
        this.signature = signature;
        this.block = block;
        this.version = version;
    }

    public encodeToHex(forHash = false) {

        const returnData = ObjectEncoding.encode(this, [
            {key: "version"},
            {key: "nonce"},
            (forHash ? null : {key: "signature"}),
            {key: "block", type: "object", encodeFunc: Block.prototype.encodeToHex}
        ]);
        
        return returnData.data;

    }

    public static fromDecodedHex(hexData: Uint, withProposerAddress = true) {

        try {
            const returnData = ObjectEncoding.decode(hexData, [
                {key: "version"},
                {key: "nonce"},
                {key: "signature"},
                {key: "block", type: "object", decodeFunc: Block.fromDecodedHex}
            ]);

            const data = returnData.data;
        
            if (data && data.version.eq(0)) {

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
        return Crypto.sha256(this.encodeToHex(true));
    }

}

export default Proposition;