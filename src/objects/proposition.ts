import EncodingUtils from "../handlers/encodingUtils.js";
import utils from "../utils/index.js";
import BigNum from "../utils/bigNum.js";
import Block from "./block.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";

export interface PropositionLike {
    readonly proposer: string;
    readonly nonce: string;
    signature: string;
    readonly block: Block;
    readonly version: string;
}

export class Proposition implements PropositionLike {
    
    public readonly proposer: string;
    public readonly nonce: string;
    public signature: string;
    public readonly block: Block;
    public readonly version: string;

    constructor(publicKey: string, nonce: string, signature: string, block: Block, version = "00") {
        this.proposer = publicKey;
        this.nonce = nonce;
        this.signature = signature;
        this.block = block;
        this.version = version;
    }

    public encodeToHex(add_empty_bytes = true) {

        const encoded_nonce = BigNum.numToHex(this.nonce);
        const nonce_length = BigNum.numToHex(encoded_nonce.length);

        const hexData = this.version +
                        this.proposer +
                        nonce_length +
                        encoded_nonce +
                        this.signature +
                        this.block.encodeToHex(false);

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string) {

        try {
            const returnData = EncodingUtils.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "proposer", length: 64},
                {key: "nonce_length", length: 2, type: "int"},
                {key: "nonce", length: "nonce_length", type: "bigint"},
                {key: "signature", length: 128},
                {key: "block", length: "", type: "object", decodeFunc: Block.fromDecodedHex}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                return utils.createInstanceFromJSON(Proposition, data);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Proposition from Decoded Hex: ${err.message}`);
        }

        return null;

    }

    public calculateHash() {
        const objWithoutBlock = JSON.parse(JSON.stringify(this));
        objWithoutBlock.blockHash = objWithoutBlock.block.hash;
        return Crypto.sha256(objWithoutBlock, ["signature", "block"]);
    }

}

export default Proposition;