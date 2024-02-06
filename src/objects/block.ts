import crypto from 'crypto';
import { getLatestBlockInfo } from '../handlers/dataHandler'; // Import the data-handler module
import config from '../handlers/configHandler';
import util from '../utils';
import Transaction from './transaction';
import mempool from './mempool';


export default class Block {

    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public nonce: number;
    public transactions: {[key: string]: Transaction};
    public coinbase: {minerAddress: string, amount: number};

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        nonce: number,
        transactions: {[key: string]: Transaction},
        coinbase: {
            minerAddress: string,
            amount: number
        }) {

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
                amount: util.mining_pow
            },
        );

    }


    public static initFromJSON(blockPreset: {
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        nonce: number,
        transactions: {[key: string]: Transaction},
        coinbase: {
            minerAddress: string,
            amount: number
        }}) {
        return new Block(
            blockPreset.index,
            blockPreset.hash,
            blockPreset.previousHash,
            blockPreset.timestamp,
            blockPreset.nonce,
            blockPreset.transactions,
            blockPreset.coinbase
        );
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