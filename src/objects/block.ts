import crypto from "crypto";
import dataHandler from "../handlers/dataHandler.js"; // Import the data-handler module
import config from "../handlers/configHandler.js";
import utils from "../utils.js";
import { Transaction, TransactionLike } from "./transaction.js";
import mempool from "../handlers/storage/mempool.js";
import fs from "fs";

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
    transactions: {[txid: string]: TransactionLike};
    coinbase: Coinbase;
}

export class Block implements BlockLike {

    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public nonce: number;
    public transactions: {[txid: string]: Transaction};
    public coinbase: Coinbase;

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        nonce: number,
        transactions: {[txid: string]: Transaction},
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
        
        const previousBlock = getLatestBlockInfo().data.main.latestBlockInfo;
    
        let newIndex;
        let previousHash;
    
        if (previousBlock === undefined || (typeof(previousBlock.index) !== 'number')) newIndex = 0;
        else newIndex = previousBlock.index + 1;
    
        if (previousBlock === undefined || (typeof(previousBlock.hash) !== 'string')) previousHash = '';
        else previousHash = previousBlock.hash;
    
        return new Block(
            newIndex,
            '',
            previousHash,
            new Date().getTime(),
            0,
            mempool.transactions,
            {
                minerAddress: config.miner.minerAddress,
                amount: utils.mining_pow
            },
        );

    }


    public static initFromJSON(preset: BlockLike) {

        for (const [txid, transaction] of Object.entries(preset.transactions)) {
            let newtransaction: Transaction;
            if (!(transaction instanceof Transaction)) {
                newtransaction = Transaction.initFromJSON(transaction);
            } else {
                newtransaction = transaction;
            }
            preset.transactions[txid] = newtransaction;
        }

        return utils.createInstanceFromJSON(Block, preset);
    }

    public static createCopy(block: Block) {
        return Block.initFromJSON(block);
    }

    public calculateBlockHash() {
        this.hash = crypto
            .createHash('sha256')
            .update(
                this.index.toString() +
                this.previousHash +
                this.timestamp +
                this.nonce +
                JSON.stringify(this.transactions) +
                JSON.stringify(this.coinbase)
            )
            .digest('hex');
    }

}

export default Block;