import config from "../handlers/configHandler.js";
import cryptoHandlers, { Crypto } from "../crypto/index.js";
import EncodingUtils from "../handlers/encodingUtils.js";
import utils from "../utils/index.js";
import { Callbacks } from "../utils/callbacks.js";
import cli from "../utils/cli.js";
import BigNum from "../utils/bigNum.js";
import Address from "./address.js";

export interface TransactionLike {

    txid: string;
    senderAddress: string;
    recipientAddress: string;
    amount: string;
    nonce: string;
    timestamp: string
    input: string;
    signature: string;
    readonly version: string;

}

export class Transaction implements TransactionLike {

    public txid: string;
    public senderAddress: string;
    public recipientAddress: string;
    public amount: string;
    public nonce: string;
    public timestamp: string
    public input: string;
    public signature: string;
    public readonly version: string;

    constructor(txid: string, senderAddress: string, recipientAddress: string, amount: string, nonce: string, timestamp: string, input: string, signature: string, version = "00") {
        this.txid = txid;
        this.senderAddress = senderAddress;
        this.recipientAddress = recipientAddress;
        this.amount = amount;
        this.nonce = nonce;
        this.timestamp = timestamp;
        this.input = input;
        this.signature = signature;
        this.version = version;
    }

    public static createCoinbaseTransaction() {

        const coinbase = new Transaction(
            "",
            "lc0xe3b0c44298fc1c149afbf4c8996fb92427ae41",
            config.staker.address,
            utils.mining_pow,
            "0",
            new Date().getTime().toString(),
            "",
            "",
        );

        const hash = Crypto.sha256(coinbase.encodeToHex(false, true), [], "buffer");
        coinbase.txid = EncodingUtils.bufferToHex(hash);
        coinbase.signature = Crypto.sign(hash, "00", "0000000000000000000000000000000000000000000000000000000000000000");

        return coinbase;
    }

    public encodeToHex(add_empty_bytes = false, forHash = false) {
    
        const returnData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            (forHash ? null : {key: "txid", type: "hash"}),
            {key: "recipientAddress", type: "address"},
            {key: "amount", type: "bigintWithLenPrefix"},
            {key: "nonce"},
            {key: "timestamp"},
            {key: "input", lengthBefore: true},
            (forHash ? null : {key: "signature"})
        ], add_empty_bytes);

        return returnData.data;

    }

    public static fromDecodedHex(hexData: string, returnLength = false, withSenderAddress = true) {

        try {
            const returnData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "txid", type: "hash"},
                {key: "recipientAddress", type: "address"},
                {key: "amount", type: "bigintWithLenPrefix"},
                {key: "nonce"},
                {key: "timestamp"},
                {key: "input", length: 2, lengthBefore: true},
                {key: "signature"}
            ], returnLength);

            const data = returnData.data;
        
            if (data && data.version === "00") {

                data.senderAddress = withSenderAddress ? Address.fromSignature(EncodingUtils.hexToBuffer(data.txid), data.signature) : "";

                const tx = utils.createInstanceFromJSON(Transaction, data);

                if (returnLength) {
                    return {data: tx, length: returnData.length};
                }
                return tx;
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Transaction from Decoded Hex: ${err.message}`);
        }

        return null;

    }

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(false, true));
    }

}


export default Transaction;