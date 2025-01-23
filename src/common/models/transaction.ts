import { AddressHex } from "./address.js";
import { Uint, Uint256, Uint64 } from "low-level";
import { PX } from "../types/prefix.js";
import { MinterCredentials } from "./minterData.js";
import { BE, DataEncoder } from "@leicoin/encoding";
import { HashableContainer } from "./container.js";
import { LCrypt, Signature } from "@leicoin/crypto";

export class Transaction extends HashableContainer {

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
    ) {super()}

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

    protected static fromDict(obj: any) {
        if (!obj.version.eq(0)) return null;

        const tx = new Transaction(
            obj.txid,
            null as any,
            obj.recipientAddress,
            obj.amount,
            obj.nonce,
            obj.timestamp,
            obj.input,
            obj.signature,
            obj.version
        );

        tx.senderAddress = AddressHex.fromSignature(tx.txid, tx.signature);

        return tx;
    }

    protected static encodingSettings: DataEncoder[] = [
        BE(PX, "version"),
        BE(Uint256, "txid", true),
        BE(AddressHex, "recipientAddress"),
        BE.BigInt("amount"),
        BE.BigInt("nonce"),
        BE.BigInt("timestamp"),
        BE.Custom("input", { type: "prefix", val: "unlimited" }),
        BE(Signature, "signature", true)
    ]

}


