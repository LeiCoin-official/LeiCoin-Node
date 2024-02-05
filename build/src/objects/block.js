import crypto from 'crypto';
import { getLatestBlockInfo } from '../handlers/dataHandler'; // Import the data-handler module
import config from '../handlers/configHandler';
import * as util from '../utils';
import mempool from './mempool';
export default class Block {
    constructor(index, hash, previousHash, timestamp, nonce, transactions, coinbase) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.transactions = transactions;
        this.coinbase = coinbase;
    }
    static createNewBlock() {
        const previousBlock = getLatestBlockInfo().data.main.latestBlockInfo;
        let newIndex;
        let previousHash;
        if (previousBlock === undefined || (typeof (previousBlock.index) !== 'number'))
            newIndex = 0;
        else
            newIndex = previousBlock.index + 1;
        if (previousBlock === undefined || (typeof (previousBlock.hash) !== 'string'))
            previousHash = '';
        else
            previousHash = previousBlock.hash;
        return new Block(newIndex, '', previousHash, new Date().getTime(), 0, mempool.transactions, {
            minerAddress: config.miner.minerAddress,
            amount: util.mining_pow
        });
    }
    static initFromJSON(blockPreset) {
        return new Block(blockPreset.index, blockPreset.hash, blockPreset.previousHash, blockPreset.timestamp, blockPreset.nonce, blockPreset.transactions, blockPreset.coinbase);
    }
    static createCopy(block) {
        return Block.initFromJSON(block);
    }
    calculateBlockHash() {
        this.hash = crypto
            .createHash('sha256')
            .update(this.index.toString() +
            this.previousHash +
            this.timestamp +
            this.nonce +
            JSON.stringify(this.transactions) +
            JSON.stringify(this.coinbase))
            .digest('hex');
    }
}
