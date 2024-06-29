import { Transaction } from "./transaction.js";
import cli from "../cli/cli.js";
import Crypto from "../crypto/index.js";
import { DataUtils } from "../utils/dataUtils.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import { AddressHex } from "./address.js";
import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import { PX } from "./prefix.js";
import Signature from "./signature.js";

export class Block {

    public index: Uint64;
    public slotIndex: Uint64;
    public hash: Uint256;
    public previousHash: Uint256;
    public timestamp: Uint64;
    public minter: AddressHex;
    public signature: Signature;
    public transactions: Transaction[];
    public version: PX;

    constructor(
        index: Uint64,
        slotIndex: Uint64,
        hash: Uint256,
        previousHash: Uint256,
        timestamp: Uint64,
        minter: AddressHex,
        signature: Signature,
        transactions: Transaction[],
        version = PX.A_00
    ) {

        this.index = index;
        this.slotIndex = slotIndex;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.minter = minter;
        this.signature = signature;
        this.transactions = transactions;
        this.version = version;

    }

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(this, Block.encodingSettings, forHash).data;
    }

    public static fromDecodedHex(hexData: Uint, returnLength = false, withMinterAddress = true) {

        try {
            const returnData = ObjectEncoding.decode(hexData, Block.encodingSettings, returnLength);

            const data = returnData.data;
        
            if (data && data.version.eq(0)) {
                const block = DataUtils.createInstanceFromJSON(Block, data);

                if (withMinterAddress) {
                    block.minter = AddressHex.fromSignature(block.calculateHash(), data.signature);
                }

                if (returnLength) {
                    return {data: block, length: returnData.length};
                }
                return block;
            }
        } catch (err: any) {
            cli.data.error(`Error loading Block from Decoded Hex: ${err.message}`);
        }

        return null;
    }

    private static encodingSettings: EncodingSettings[] = [
        {key: "version"},
        {key: "index"},
        {key: "slotIndex"},
        {key: "hash", hashRemove: true},
        {key: "previousHash", type: "hash"},
        {key: "timestamp"},
        {key: "signature", hashRemove: true},
        {key: "transactions", type: "array", length: 2, encodeFunc: Transaction.prototype.encodeToHex, decodeFunc: Transaction.fromDecodedHex}
    ]

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(true));
    }

}


export default Block;

