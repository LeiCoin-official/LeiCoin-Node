import crypto from 'crypto';
import dataHandler from '../handlers/dataHandler'; // Import the data-handler module
import config from '../handlers/configHandler';
import utils from '../utils';
import { Transaction, TransactionLike } from './transaction';
import mempool from './mempool';
import fs from 'fs';

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

    public static isGenesisBlock() {
    
        try {
    
            const latestblockinfoFileData = getLatestBlockInfo();
    
            if (latestblockinfoFileData.cb === "success") {
                const latestANDPreviousForkBlockInfo = latestblockinfoFileData.data.main
                if ((latestANDPreviousForkBlockInfo !== null) && (latestANDPreviousForkBlockInfo !== undefined)) {
    
                    const previousBlockInfo = latestANDPreviousForkBlockInfo.previousBlockInfo || null;
                    const latestBlockInfo = latestANDPreviousForkBlockInfo.latestBlockInfo || null;
    
                    if ((previousBlockInfo !== null) && (previousBlockInfo !== undefined)) {
                        if (typeof(previousBlockInfo) === "object") {
                            if (((previousBlockInfo.index !== null) && (previousBlockInfo.index !== undefined)) && ((previousBlockInfo.hash !== null) && (previousBlockInfo.hash !== undefined))) {
                                return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                            }
                        }
                    } else if ((latestBlockInfo !== null) && (latestBlockInfo !== undefined)) {
                        if (typeof(latestBlockInfo) === "object") {
                            if (((latestBlockInfo.index !== null) && (latestBlockInfo.index !== undefined)) && ((latestBlockInfo.hash !== null) && (latestBlockInfo.hash !== undefined))) {
                                return { isGenesisBlock: true, isForkOFGenesisBlock: true };
                            }
                        }
                    }
    
                }
            }
        
            return { isGenesisBlock: true, isForkOFGenesisBlock: false };
        } catch (err: any) {
            utils.data_message.error(`Error checking for existing blocks: ${err.message}`);
            return { isGenesisBlock: false, isForkOFGenesisBlock: false };
        }
    }

    
    // Function to write a block
    public writeBlock() {
        const blockNumber = this.index;
        const blockHash = this.hash;
        const blockFilePath = dataHandler.getBlockchainDataFilePath(`/blocks/${blockNumber}.json`);
        const blocksListFilePath = dataHandler.getBlockchainDataFilePath('/indexes/blocks.json');

        try {
            // Check if the block file already exists.
            if (!fs.existsSync(blockFilePath)) {
                // Write the block data to the block file.
                fs.writeFileSync(blockFilePath, JSON.stringify(this), { encoding: 'utf8', flag: 'w' });

                // Update the list of blocks.
                const blocksListData = fs.readFileSync(blocksListFilePath, 'utf8');
                const blocksList = JSON.parse(blocksListData);
                blocksList.push({ hash: blockHash, index: blockNumber });
                fs.writeFileSync(blocksListFilePath, JSON.stringify(blocksList), { encoding: 'utf8', flag: 'w' });

                return { cb: 'success' };
            } else {
                utils.data_message.error(`Block ${blockNumber} already exists and cannot be overwritten.`);
                return { cb: 'error' };
            }
        } catch (err: any) {
            utils.data_message.error(`Error writing block ${blockNumber}: ${err.message}.`);
            return { cb: 'error' };
        }
    }

    // Function to read a block
    public static readBlock(blockIndex: number) {
        const blockFilePath = dataHandler.getBlockchainDataFilePath(`/blocks/${blockIndex}.json`);
        try {
            if (fs.existsSync(blockFilePath)) {
                const data = fs.readFileSync(blockFilePath, 'utf8');
                return {cb: "success", block: Block.initFromJSON(JSON.parse(data))};
            } else {
                utils.data_message.error(`Block ${blockIndex} was not found.`);
                return {cb: 'none'};
            }
        } catch (err: any) {
            utils.data_message.error(`Error reading block ${blockIndex}: ${err.message}.`);
            return {cb: 'error'};
        }
    }



}

export default Block;