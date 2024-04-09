import config from "../handlers/configHandler.js";
import cryptoHandlers from "../crypto/index.js";
import encodingHandlers from "../handlers/encodingUtils.js";
import utils from "../utils/index.js";
import { Callbacks } from "../utils/callbacks.js";
import cli from "../utils/cli.js";
import BigNum from "../utils/bigNum.js";

export interface TransactionLike {

    txid: string;
    senderAddress: string;
    senderPublicKey: string;
    recipientAddress: string;
    amount: string;
    nonce: string;
    timestamp: string
    message: string;
    signature: string;
    readonly version: string;

}

export class Transaction implements TransactionLike {

    public txid: string;
    public senderAddress: string;
    public senderPublicKey: string;
    public recipientAddress: string;
    public amount: string;
    public nonce: string;
    public timestamp: string
    public message: string;
    public signature: string;
    public readonly version: string;

    constructor(txid: string, senderAddress: string, senderPublicKey: string, recipientAddress: string, amount: string, nonce: string, timestamp: string, message: string, signature: string, version = "00") {
        this.txid = txid;
        this.senderAddress = senderAddress;
        this.senderPublicKey = senderPublicKey;
        this.recipientAddress = recipientAddress;
        this.amount = amount;
        this.nonce = nonce;
        this.timestamp = timestamp;
        this.message = message;
        this.signature = signature;
        this.version = version;
    }

    public static createCoinbaseTransaction() {
        const coinbase = new Transaction(
            "",
            "lc0x6c6569636f696e6e65745f636f696e62617365",
            "6c6569636f696e6e65745f636f696e62617365",
            config.miner.minerAddress,
            utils.mining_pow,
            "0",
            new Date().getTime().toString(),
            "",
            "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        );
        coinbase.txid = cryptoHandlers.sha256(coinbase, ["txid", "version"]);
        return coinbase;
    }

    public encodeToHex(add_empty_bytes = false) {      
    
        const encoded_amount = BigNum.numToHex(this.amount);
        const amount_length = BigNum.numToHex(encoded_amount.length);

        const encoded_nonce = BigNum.numToHex(this.nonce);
        const nonce_length = BigNum.numToHex(encoded_nonce.length);

        const encoded_timestamp = BigNum.numToHex(this.timestamp);
        const timestamp_length = BigNum.numToHex(encoded_timestamp.length);

        const message_length = BigNum.numToHex(this.message.length);

        const hexData = this.version +
                        this.txid +
                        encodingHandlers.encodeAddressToHex(this.senderAddress) +
                        this.senderPublicKey +
                        encodingHandlers.encodeAddressToHex(this.recipientAddress) +
                        amount_length +
                        encoded_amount +
                        nonce_length +
                        encoded_nonce +
                        timestamp_length +
                        encoded_timestamp +
                        message_length +
                        this.message +
                        this.signature;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string, returnLength = false) {

        try {
            const returnData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "txid", length: 64},
                {key: "senderAddress", length: 40},
                {key: "senderPublicKey", length: 64},
                {key: "recipientAddress", length: 40},
                {key: "amount_length", length: 2, type: "int"},
                {key: "amount", length: "amount_length", type: "bigint"},
                {key: "nonce_length", length: 2, type: "int"},
                {key: "nonce", length: "nonce_length", type: "bigint"},
                {key: "timestamp_length", length: 2, type: "int"},
                {key: "timestamp", length: "timestamp_length", type: "bigint"},
                {key: "message_length", length: 2, type: "int"},
                {key: "message", length: "message_length"},
                {key: "signature", length: 128}
            ], returnLength);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                data.senderAddress = encodingHandlers.decodeHexToAddress(data.senderAddress);
                data.recipientAddress = encodingHandlers.decodeHexToAddress(data.recipientAddress);

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

}


export default Transaction;