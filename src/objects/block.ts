import { Transaction } from "./transaction.js";
import cli from "../cli/cli.js";
import LCrypt from "../crypto/index.js";
import { DataUtils } from "../utils/dataUtils.js";
import { Uint, Uint256, Uint64 } from "../binary/uint.js";
import { AddressHex } from "./address.js";
import ObjectEncoding from "../encoding/objects.js";
import { PX } from "./prefix.js";
import Signature from "../crypto/signature.js";
import { BE, DataEncoder } from "../encoding/binaryEncoders.js";

export class Block {

    constructor(
        public index: Uint64,
        public slotIndex: Uint64,
        public hash: Uint256,
        public previousHash: Uint256,
        public timestamp: Uint64,
        public minter: AddressHex,
        public signature: Signature,
        public transactions: Transaction[],
        public readonly version: PX = PX.A_00
    ) {}

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(this, Block.encodingSettings, forHash).data;
    }

    public static fromDecodedHex(hexData: Uint, returnLength = false, withMinterAddress = true) {

        try {
            const returnData = ObjectEncoding.decode(hexData, Block.encodingSettings, returnLength);

            const data = returnData.data;
        
            if (data && data.version.eq(0)) {
                const block = new Block(
                    data.index,
                    data.slotIndex,
                    data.hash,
                    data.previousHash,
                    data.timestamp,
                    null as any,
                    data.signature,
                    data.transactions,
                    data.version
                );

                if (withMinterAddress) {
                    block.minter = AddressHex.fromSignature(block.calculateHash(), data.signature);
                }

                if (returnLength) {
                    return {data: block, length: returnData.length};
                }
                return block;
            }
        } catch (err: any) {
            cli.data.error(`Error loading Block from Decoded Hex: ${err.stack}`);
        }

        return null;
    }

    private static encodingSettings: DataEncoder[] = [
        BE.PX("version"),
        BE.BigInt("index"),
        BE.BigInt("slotIndex"),
        BE.Hash("hash", true),
        BE.Hash("previousHash"),
        BE.BigInt("timestamp"),
        BE.Signature("signature", true),
        BE.Array("transactions", 2, Transaction.prototype.encodeToHex, Transaction.fromDecodedHex)
    ]

    public calculateHash() {
        return LCrypt.sha256(this.encodeToHex(true));
    }

}


export default Block;

