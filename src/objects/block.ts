import crypto from "crypto";
import config from "../handlers/configHandler.js";
import utils from "../utils/utils.js";
import { Transaction, TransactionLike } from "./transaction.js";
import mempool from "../handlers/storage/mempool.js";
import blockchain from "../handlers/storage/blockchain.js";
import cryptoHandlers from "../handlers/cryptoHandlers.js";

export interface BlockLike {
    index: number;
    hash: string;
    previousHash: string;
    timestamp: number;
    nonce: number;
    transactions: Transaction[];
}

export class Block implements BlockLike {

    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public nonce: number;
    public transactions: Transaction[];

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        nonce: number,
        transactions: Transaction[],
    ) {

        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.transactions = transactions;

    }

    public static createNewBlock() {
        
        const previousBlock = blockchain.getLatestBlockInfo().data.main.latestBlockInfo;
    
        let newIndex;
        let previousHash;
    
        if (!previousBlock || (typeof(previousBlock.index) !== 'number')) newIndex = 0;
        else newIndex = previousBlock.index + 1;
    
        if (!previousBlock || (typeof(previousBlock.hash) !== 'string')) previousHash = '';
        else previousHash = previousBlock.hash;

        const coinbase = new Transaction(
            "",
            "coinbase",
            "coinbase", 
            [{
                utxoid: "coinbase"
            }],
            [{
                recipientAddress: config.miner.minerAddress,
                amount: utils.mining_pow
            }],
            "coinbase",
            true
        )

        coinbase.txid = crypto.createHash('sha256')
            .update(JSON.stringify(
                cryptoHandlers.getPreparedObjectForHashing(coinbase, ["txid", "coinbase"])
            )).digest('hex');

        const transactions = Object.values(mempool.transactions);
        transactions.unshift(coinbase)
    
        return new Block(
            newIndex,
            '',
            previousHash,
            new Date().getTime(),
            0,
            transactions
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