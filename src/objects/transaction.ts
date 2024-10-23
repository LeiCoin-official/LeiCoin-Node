import LCrypt from "../crypto/index.js";
import ObjectEncoding from "../encoding/objects.js";
import cli from "../cli/cli.js";
import { AddressHex } from "./address.js";
import { Uint, Uint256, Uint64 } from "low-level/uint";
import Signature from "../crypto/signature.js";
import { PX } from "./prefix.js";
import { MinterCredentials } from "./minter.js";
import { BE, DataEncoder } from "../encoding/binaryEncoders.js";

export class Transaction {

    constructor(
        public txid: Uint256,
        public senderAddress: AddressHex,
        public recipientAddress: AddressHex,
        public amount: Uint64,
        public nonce: Uint64,
        public timestamp: Uint64,
        public input: Uint,
        public signature: Signature,
        public readonly version = PX.V_00
    ) {}

    public static createCoinbaseTransaction(mc: MinterCredentials) {

        const coinbase = new Transaction(
            Uint256.alloc(),
            AddressHex.from("007f9c9e31ac8256ca2f258583df262dbc7d6f68f2"),
            mc.address,
            Uint64.from(10),
            Uint64.from(0),
            Uint64.from(new Date().getTime()),
            Uint.empty(),
            Signature.alloc(),
        );

        const hash = LCrypt.sha256(coinbase.encodeToHex(true));
        coinbase.txid = hash;
        coinbase.signature = LCrypt.sign(hash, PX.V_00, Uint256.alloc());

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
                const instance = new Transaction(
                    data.txid,
                    null as any,
                    data.recipientAddress,
                    data.amount,
                    data.nonce,
                    data.timestamp,
                    data.input,
                    data.signature,
                    data.version
                )

                if (withSenderAddress) {
                    instance.senderAddress = AddressHex.fromSignature(data.txid, data.signature);
                }

                if (returnData.length) {
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
        BE(PX, "version"),
        BE(Uint256, "txid", true),
        BE(AddressHex, "recipientAddress"),
        BE.BigInt("amount"),
        BE.BigInt("nonce"),
        BE.BigInt("timestamp"),
        BE.Custom("input", { type: "prefix", val: "unlimited" }),
        BE(Signature, "signature", true)
    ]

    public calculateHash() {
        return LCrypt.sha256(this.encodeToHex(true));
    }

}


export default Transaction;