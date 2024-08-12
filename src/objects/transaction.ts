import config from "../config/index.js";
import Crypto from "../crypto/index.js";
import ObjectEncoding from "../encoding/objects.js";
import utils from "../utils/index.js";
import cli from "../cli/cli.js";
import { AddressHex } from "./address.js";
import { DataUtils } from "../utils/dataUtils.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import Signature from "./signature.js";
import { PX } from "./prefix.js";
import { MinterCredentials } from "./minter.js";
import { BE, DataEncoder } from "../encoding/binaryEncoders.js";

export class Transaction {

    public txid: Uint256;
    public senderAddress: AddressHex;
    public recipientAddress: AddressHex;
    public amount: Uint64;
    public nonce: Uint64;
    public timestamp: Uint64;
    public input: Uint;
    public signature: Signature;
    public readonly version: PX;

    constructor(
        txid: Uint256,
        senderAddress: AddressHex,
        recipientAddress: AddressHex,
        amount: Uint64,
        nonce: Uint64,
        timestamp: Uint64,
        input: Uint,
        signature: Signature,
        version = PX.V_00
    ) {
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

    public static createCoinbaseTransaction(mc: MinterCredentials) {

        const coinbase = new Transaction(
            Uint256.alloc(),
            AddressHex.from("007f9c9e31ac8256ca2f258583df262dbc7d6f68f2"),
            mc.address,
            Uint64.from(utils.mining_pow),
            Uint64.from(0),
            Uint64.from(new Date().getTime()),
            Uint.empty(),
            Signature.alloc(),
        );

        const hash = Crypto.sha256(coinbase.encodeToHex(true));
        coinbase.txid = hash;
        coinbase.signature = Crypto.sign(hash, PX.V_00, Uint256.alloc());

        return coinbase;
    }

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(this, Transaction.encodingSettings, forHash).data;
    }

    public static fromDecodedHex(hexData: Uint, returnLength = false, withSenderAddress = true) {
        try {
            const returnData = ObjectEncoding.decode(hexData, Transaction.encodingSettings, returnLength);
            const data = returnData.data;
        
            if (data && data.version.eq(0)) {

                data.senderAddress = null
                const instance = DataUtils.createInstanceFromJSON(Transaction, data);

                if (withSenderAddress) {
                    instance.senderAddress = AddressHex.fromSignature(data.txid, data.signature);
                }

                if (returnLength) {
                    return {data: instance, length: returnData.length};
                }
                return instance;
            }
        } catch (err: any) {
            cli.data.error(`Error loading Transaction from Decoded Hex: ${err.stack}`);
        }
        return null;
    }

    private static encodingSettings: DataEncoder[] = [
        BE.PX("version"),
        BE.Hash("txid", true),
        BE.Address("recipientAddress"),
        BE.BigInt("amount"),
        BE.BigInt("nonce"),
        BE.BigInt("timestamp"),
        BE.Custom("input", { type: "prefix", val: "unlimited" }),
        BE.Signature("signature", true)
    ]

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(true));
    }

}


export default Transaction;