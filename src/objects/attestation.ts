import EncodingUtils from "../handlers/encodingUtils.js";
import utils from "../utils/index.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";

export interface AttestationLike {
    publicKey: string;
    blockHash: string;
    vote: boolean;
    nonce: string;
    signature: string;
    version: string;
}

export class Attestation implements AttestationLike {
    
    public publicKey: string;
    public blockHash: string;
    public vote: boolean;
    public nonce: string;
    public signature: string;
    public readonly version: string;

    constructor(publicKey: string, blockHash: string, vote: boolean, nonce: string, signature: string, version = "00") {
        this.publicKey = publicKey;
        this.blockHash = blockHash;
        this.vote = vote;
        this.nonce = nonce;
        this.signature = signature;
        this.version = version;
    }

    public encodeToHex(add_empty_bytes = true, forHash = false) {

        const returnData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "publicKey"},
            {key: "blockHash", type: "hash"},
            {key: "vote", type: "bool"},
            {key: "nonce"},
            (forHash ? null : {key: "signature"})
        ], add_empty_bytes);

        return returnData.data;

    }

    public static fromDecodedHex(hexData: string) {

        try {
            const returnData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "publicKey", length: 64},
                {key: "blockHash", type: "hash"},
                {key: "vote", type: "bool"},
                {key: "nonce"},
                {key: "signature"}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                return utils.createInstanceFromJSON(Attestation, data);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Attestation from Decoded Hex: ${err.message}`);
        }

        return null;

    }

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(false, true));
    }

}

export default Attestation;
