import config from "../handlers/configHandler.js";
import cryptoHandlers from "../handlers/cryptoHandlers.js";
import encodingHandlers from "../handlers/encodingHandlers.js";
import utils from "../utils/utils.js";
import { Callbacks } from "../utils/callbacks.js";
import cli from "../utils/cli.js";

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
            "0000000000000000000000000000000000000000000000000000000000000000",
        );
        coinbase.txid = cryptoHandlers.sha256(coinbase, ["txid", "version"]);
        return coinbase;
    }

    public encodeToHex(add_empty_bytes = false) {

        const encoded_senderPublicKey = encodingHandlers.encodeBase64ToHex(this.senderPublicKey);
        const senderPublicKey_length = encoded_senderPublicKey.length.toString().padStart(3, "0");        
    
        const encoded_amount = encodingHandlers.compressZeros(this.amount.toString());
        const amount_length = encoded_amount.length.toString().padStart(2, "0");

        const encoded_nonce = encodingHandlers.compressZeros(this.nonce.toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        const timestamp_length = this.timestamp.length.toString().padStart(2, "0");

        const encoded_message = encodingHandlers.encodeBase64ToHex(this.message);
        const message_length = encoded_message.length.toString().padStart(3, "0");

        const hexData = this.version +
                        this.txid +
                        encodingHandlers.encodeAddressToHex(this.senderAddress) +
                        senderPublicKey_length +
                        encoded_senderPublicKey +
                        encodingHandlers.encodeAddressToHex(this.recipientAddress) +
                        amount_length +
                        encoded_amount +
                        nonce_length +
                        encoded_nonce +
                        timestamp_length +
                        this.timestamp +
                        message_length +
                        encoded_message +
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
                {key: "senderPublicKey_length", length: 3},
                {key: "senderPublicKey", length: "senderPublicKey_length"},
                {key: "recipientAddress", length: 40},
                {key: "amount_length", length: 2},
                {key: "amount", length: "amount_length"},
                {key: "nonce_length", length: 2},
                {key: "nonce", length: "nonce_length"},
                {key: "timestamp_length", length: 2},
                {key: "timestamp", length: "timestamp_length"},
                {key: "message_length", length: 3},
                {key: "message", length: "message_length", decode: true},
                {key: "signature", length: 64}
            ], returnLength);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                data.senderAddress = encodingHandlers.decodeHexToAddress(data.senderAddress);
                data.senderPublicKey = encodingHandlers.decodeHexToBase64(data.senderPublicKey);
                data.recipientAddress = encodingHandlers.decodeHexToAddress(data.recipientAddress);
                data.amount = encodingHandlers.decompressZeros(data.amount);
                data.nonce = encodingHandlers.decompressZeros(data.nonce);
                data.message = encodingHandlers.decodeHexToBase64(data.message);

                const tx = utils.createInstanceFromJSON(Transaction, data)

                if (returnLength) {
                    return {data: tx, length: returnData.lengh};
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