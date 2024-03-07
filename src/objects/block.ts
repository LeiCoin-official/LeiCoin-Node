import crypto from "crypto";
import utils from "../utils/utils.js";
import { Transaction } from "./transaction.js";
import mempool from "../storage/mempool.js";
import blockchain from "../storage/blockchain.js";
import encodingHandlers from "../handlers/encodingHandlers.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";

export interface BlockLike {
    index: string;
    hash: string;
    previousHash: string;
    timestamp: string;
    nonce: string;
    transactions: Transaction[];
    readonly version: string;
}

export class Block implements BlockLike {

    public index: string;
    public hash: string;
    public previousHash: string;
    public timestamp: string;
    public nonce: string;
    public transactions: Transaction[];
    public readonly version: string;

    constructor(
        index: string,
        hash: string,
        previousHash: string,
        timestamp: string,
        nonce: string,
        transactions: Transaction[],
        version = "00"
    ) {

        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.transactions = transactions;
        this.version = version;

    }

    public static createNewBlock() {
        
        const previousBlock = blockchain.chainstate.getChainState().latestBlockInfo;
    
        let newIndex;
        let previousHash;
    
        if (!previousBlock || (typeof(previousBlock.index) !== 'number')) newIndex = "0";
        else newIndex = BigNum.add(previousBlock.index, "1");
    
        if (!previousBlock || (typeof(previousBlock.hash) !== 'string')) previousHash = '';
        else previousHash = previousBlock.hash;

        const coinbase = Transaction.createCoinbaseTransaction();

        const transactions = Object.values(mempool.transactions);
        transactions.unshift(coinbase)
    
        return new Block(
            newIndex,
            '',
            previousHash,
            new Date().getTime().toString(),
            "0",
            transactions
        );

    }

    public encodeToHex(add_empty_bytes = true) {   
    
        const encoded_index = encodingHandlers.compressZeros(this.index);
        const index_length = encoded_index.length.toString().padStart(2, "0");

        const timestamp_length = this.timestamp.length.toString().padStart(2, "0");

        const encoded_nonce = encodingHandlers.compressZeros(this.nonce.toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        let encoded_transactions = this.transactions.length.toString() + "E";

        for (let transaction of this.transactions) {
            encoded_transactions += transaction.encodeToHex();
        }

        const hexData = this.version +
                        index_length +
                        encoded_index +
                        this.hash +
                        this.previousHash +
                        timestamp_length +
                        this.timestamp +
                        nonce_length +
                        encoded_nonce + 
                        encoded_transactions;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string) {

        try {
            const returnData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "index_length", length: 2},
                {key: "index", length: "index_length"},
                {key: "hash", length: 64},
                {key: "previousHash", length: 64},
                {key: "timestamp_length", length: 2},
                {key: "timestamp", length: "timestamp_length"},
                {key: "nonce_length", length: 2},
                {key: "nonce", length: "nonce_length"},
                {key: "transactions", length: "", type: "array", arrayFunc: Transaction.fromDecodedHex}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                data.index = encodingHandlers.decompressZeros(data.index);
                data.nonce = encodingHandlers.decompressZeros(data.nonce);

                return utils.createInstanceFromJSON(Block, data);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Block from Decoded Hex: ${err.message}`);
        }

        return null;
    }

    public static createCopy(block: Block) {
        //return Block.initFromJSON(block);
    }

    public calculateHash(modifyedBlock: {[key: string]: any}) {
        this.hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(modifyedBlock))
            .digest('hex');
    }

}

export default Block;