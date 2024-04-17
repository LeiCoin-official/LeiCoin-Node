import EncodingUtils from "../handlers/encodingUtils.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";
import { AddressHex } from "./address.js";
import DataUtils from "../utils/dataUtils.js";

export interface AttestationLike {
    attester: string;
    blockHash: string;
    vote: boolean;
    nonce: string;
    signature: string;
    version: string;
}

export class Attestation implements AttestationLike {
    
    public attester: string;
    public blockHash: string;
    public vote: boolean;
    public nonce: string;
    public signature: string;
    public readonly version: string;

    constructor(attester: string, blockHash: string, vote: boolean, nonce: string, signature: string, version = "00") {
        this.attester = attester;
        this.blockHash = blockHash;
        this.vote = vote;
        this.nonce = nonce;
        this.signature = signature;
        this.version = version;
    }

    public encodeToHex(add_empty_bytes = true, forHash = false) {

        const returnData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "blockHash", type: "hash"},
            {key: "vote", type: "bool"},
            {key: "nonce"},
            (forHash ? null : {key: "signature"})
        ], add_empty_bytes);

        return returnData.data;

    }

    public static fromDecodedHex(hexData: string, withAttesterAddress = true) {

        try {
            const returnData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "blockHash", type: "hash"},
                {key: "vote", type: "bool"},
                {key: "nonce"},
                {key: "signature"}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {

                data.attester = "";
                const instance = DataUtils.createInstanceFromJSON(Attestation, data);

                if (withAttesterAddress) {
                    const hash = Crypto.sha256(instance.encodeToHex(false, true), [], "buffer");
                    instance.attester = AddressHex.fromSignature(hash, data.signature);
                }

                return instance;
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
