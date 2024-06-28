import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import Block from "./block.js";
import cli from "../cli/cli.js";
import Crypto from "../crypto/index.js";
import { AddressHex } from "./address.js";
import { DataUtils } from "../utils/dataUtils.js";
import { Uint64, Uint } from "../utils/binary.js";
import Signature from "./signature.js";
import { PX } from "./prefix.js";

export class Proposition {
    
    public proposer: AddressHex;
    public slotIndex: Uint64;
    public signature: Signature;
    public block: Block;
    public version: PX;

    constructor(proposer: AddressHex, slotIndex: Uint64, signature: Signature, block: Block, version = PX.V_00) {
        this.proposer = proposer;
        this.slotIndex = slotIndex;
        this.signature = signature;
        this.block = block;
        this.version = version;
    }

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(this, Proposition.encodingSettings, forHash).data;
    }

    public static fromDecodedHex(hexData: Uint, withProposerAddress = true) {
        try {
            const returnData = ObjectEncoding.decode(hexData, Proposition.encodingSettings);
            const data = returnData.data;
        
            if (data && data.version.eq(0)) {

                data.proposer = null;
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

    private static encodingSettings: EncodingSettings[] = [
        {key: "version"},
        {key: "slotIndex"},
        {key: "signature", hashRemove: true},
        {key: "block", type: "object", encodeFunc: Block.prototype.encodeToHex, decodeFunc: Block.fromDecodedHex}
    ]

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(true));
    }

}

export default Proposition;