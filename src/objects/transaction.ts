import config from "../handlers/configHandler.js";
import Crypto from "../crypto/index.js";
import EncodingUtils from "../handlers/encodingUtils.js";
import utils from "../utils/index.js";
import cli from "../utils/cli.js";
import { AddressHex } from "./address.js";
import DataUtils from "../utils/dataUtils.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";

export class Transaction {

    public txid: Uint256;
    public senderAddress: AddressHex;
    public recipientAddress: AddressHex;
    public amount: Uint64;
    public nonce: Uint64;
    public timestamp: Uint64;
    public input: Uint;
    public signature: Uint;
    public readonly version: Uint;

    constructor(txid: Uint256, senderAddress: AddressHex, recipientAddress: AddressHex, amount: Uint64, nonce: Uint64, timestamp: Uint64, input: Uint, signature: Uint, version = Uint.from("00")) {
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
            Uint256.alloc(),
            AddressHex.fromHex("00e3b0c44298fc1c149afbf4c8996fb92427ae41e4"),
            AddressHex.fromHex(config.staker.address),
            Uint64.from(utils.mining_pow),
            Uint64.from(0),
            Uint64.from(new Date().getTime()),
            Uint.alloc(0),
            Uint.alloc(0),
        );

        const hash = Crypto.sha256(coinbase.encodeToHex(false, true), "binary");
        coinbase.txid = hash;
        coinbase.signature = Crypto.sign(hash, "00", Uint256.alloc());

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
            {key: "input", lengthBefore: "unlimited"},
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
                {key: "input", lengthBefore: "unlimited"},
                {key: "signature"}
            ], returnLength);

            const data = returnData.data;
        
            if (data && data.version === "00") {

                data.senderAddress = "";
                const instance = DataUtils.createInstanceFromJSON(Transaction, data);

                if (withSenderAddress) {
                    const hash = EncodingUtils.hexToBuffer(data.txid);
                    instance.senderAddress = AddressHex.fromSignature(hash, data.signature);
                }

                if (returnLength) {
                    return {data: instance, length: returnData.length};
                }
                return instance;
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