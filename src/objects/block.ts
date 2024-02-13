import crypto from "crypto";
import config from "../handlers/configHandler.js";
import utils from "../utils.js";
import { Transaction, TransactionLike } from "./transaction.js";
import mempool from "../handlers/storage/mempool.js";
import blockchain from "../handlers/storage/blockchain.js";

export interface Coinbase {
    minerAddress: string;
    amount: number;
}

export interface BlockLike {
    index: number;
    hash: string;
    previousHash: string;
    timestamp: number;
    nonce: number;
    transactions: Transaction[];
    coinbase: Coinbase;
}

export class Block implements BlockLike {

    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public nonce: number;
    public transactions: Transaction[];
    public coinbase: Coinbase;

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        nonce: number,
        transactions: Transaction[],
        coinbase: Coinbase
    ) {

        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.transactions = transactions;
        this.coinbase = coinbase;

    }

    public static createNewBlock() {
        
        const previousBlock = blockchain.getLatestBlockInfo().data.main.latestBlockInfo;
    
        let newIndex;
        let previousHash;
    
        if (!previousBlock || (typeof(previousBlock.index) !== 'number')) newIndex = 0;
        else newIndex = previousBlock.index + 1;
    
        if (!previousBlock || (typeof(previousBlock.hash) !== 'string')) previousHash = '';
        else previousHash = previousBlock.hash;
    
        return new Block(
            newIndex,
            '',
            previousHash,
            new Date().getTime(),
            0,
            Object.values(mempool.transactions),
            {
                minerAddress: config.miner.minerAddress,
                amount: utils.mining_pow
            },
        );

    }

    public static initFromJSON(preset: BlockLike) {

        for (const [index, transaction] of preset.transactions.entries()) {
            let newtransaction: Transaction;
            if (!(transaction instanceof Transaction)) {
                newtransaction = Transaction.initFromJSON(transaction);
            } else {
                newtransaction = transaction;
            }
            preset.transactions[index] = newtransaction;
        }

        return utils.createInstanceFromJSON(Block, preset);
    }

    public static createCopy(block: Block) {
        return Block.initFromJSON(block);
    }

    public calculateHash(modifyedBlock: {[key: string]: any}) {
        this.hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(modifyedBlock))
            .digest('hex');
    }

}

export default Block;