import encodingHandlers from "../handlers/encodingHandlers.js";
import utils from "../utils/index.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";

export interface AttestationInBlockLike {
    publicKey: string;
    vote: boolean;
    signature: string;
}

export interface AttestationSendDataLike extends AttestationInBlockLike {
    blockHash: string;
    nonce: string;
    version: string;
}

export class AttestationInBlock implements AttestationInBlockLike {
    
    public readonly publicKey: string;
    public readonly vote: boolean;
    public readonly signature: string;

    constructor(publicKey: string, vote: boolean, signature: string) {
        this.publicKey = publicKey;
        this.vote = vote;
        this.signature = signature;
    }

    public encodeToHex(add_empty_bytes = false) {

        const hexData = this.publicKey +
                        this.vote +
                        this.signature;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string, returnLength = false) {

        try {
            const returnData = encodingHandlers.splitHex(hexData, [
                {key: "publicKey", length: 64},
                {key: "vote", length: 1, type: "bool"},
                {key: "signature", length: 128}
            ], returnLength);

            const data = returnData.data;
        
            if (data && data.version === "00") {

                const attestation = utils.createInstanceFromJSON(AttestationInBlock, data);

                if (returnLength) {
                    return {data: attestation, length: returnData.length};
                }
                return attestation;
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Attestation from Decoded Hex: ${err.message}`);
        }

        return null;

    }

}

export class AttestationSendData extends AttestationInBlock implements AttestationSendDataLike {
    
    public readonly blockHash: string;
    public readonly nonce: string;
    public readonly version: string;

    constructor(publicKey: string, blockHash: string, vote: boolean, nonce: string, signature: string, version = "00") {
        super(publicKey, vote, signature);
        this.blockHash = blockHash;
        this.nonce = nonce;
        this.version = version;
    }

    public encodeToHex(add_empty_bytes = true) {

        const encoded_nonce = BigNum.numToHex(this.nonce);
        const nonce_length = BigNum.numToHex(encoded_nonce.length);

        const hexData = this.version +
                        this.publicKey +
                        this.blockHash +
                        this.vote +
                        nonce_length +
                        encoded_nonce +
                        this.signature;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string) {

        try {
            const returnData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "publicKey", length: 64},
                {key: "blockHash", length: 64},
                {key: "vote", length: 1, type: "bool"},
                {key: "nonce_length", length: 2, type: "int"},
                {key: "nonce", length: "nonce_length", type: "bigint"},
                {key: "signature", length: 128}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                return utils.createInstanceFromJSON(AttestationSendData, data);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Attestation from Decoded Hex: ${err.message}`);
        }

        return null;

    }

}
