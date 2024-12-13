import { Transaction } from "./transaction.js";
import cli from "../cli/cli.js";
import LCrypt from "../crypto/index.js";
import { Uint, Uint256, Uint64 } from "low-level";
import { AddressHex } from "./address.js";
import ObjectEncoding from "../encoding/objects.js";
import { PX } from "./prefix.js";
import Signature from "../crypto/signature.js";
import { BE, DataEncoder } from "../encoding/binaryEncoders.js";
import { Container } from "./container.js";

export class Block extends Container {

    constructor(
        public index: Uint64,
        public slotIndex: Uint64,
        public hash: Uint256,
        public previousHash: Uint256,
        public timestamp: Uint64,
        public minter: AddressHex,
        public signature: Signature,
        public transactions: Transaction[],
        //public body: BlockBody,
        public readonly version: PX = PX.A_00
    ) {super()}

    protected static fromDict(obj: Dict<any>) {

        if (obj.version.eqn(0)) return null;

        const block = new Block(
            obj.index,
            obj.slotIndex,
            obj.hash,
            obj.previousHash,
            obj.timestamp,
            null as any,
            obj.signature,
            obj.transactions,
            obj.version
        );

        block.minter = AddressHex.fromSignature(block.calculateHash(), block.signature);

        return block;
    }

    protected static encodingSettings: DataEncoder[] = [
        BE(PX,"version"),
        BE.BigInt("index"),
        BE.BigInt("slotIndex"),
        BE(Uint256, "hash", true),
        BE(Uint256, "previousHash"),
        BE.BigInt("timestamp"),
        BE(Signature,"signature", true),
        BE.Array("transactions", 2, Transaction)
    ]

    public calculateHash() {
        return LCrypt.sha256(this.encodeToHex(true));
    }

}


export class BlockBody {

    constructor(
        public transactions: Transaction[]
    ) {}

}



export default Block;

