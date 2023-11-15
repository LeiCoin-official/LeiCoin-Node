const crypto = require('crypto');
const { getLatestBlockInfo, mempool } = require('../handlers/dataHandler'); // Import the data-handler module
const config = require('../handlers/configHandler');
const util = require('../utils');

// Function to create a new block
function createBlock() {

	previousBlock = getLatestBlockInfo().data.main.latestBlockInfo;

	let newIndex;
	let previousHash;

	if (previousBlock === undefined || (typeof(previousBlock.index) !== 'number')) newIndex = 0;
	else newIndex = previousBlock.index + 1;

	if (previousBlock === undefined || (typeof(previousBlock.hash) !== 'string')) previousHash = '';
	else previousHash = previousBlock.hash;

    const newBlock = {
      	index: newIndex,
		previousHash: previousHash,
		transactions: mempool.transactions,
		timestamp: new Date().getTime(),
		nonce: 0,
		coinbase: {
			minerAddress: config.miner.minerAddress,
			amount: util.mining_pow
		},
		hash: '',
    };

    return newBlock;
}

// Function to calculate the hash of a block
function calculateBlockHash(block) {
  	return crypto
    	.createHash('sha256')
    	.update(
      		block.index +
        	block.previousHash +
        	JSON.stringify(block.transactions) +
        	block.timestamp +
        	block.nonce +
			JSON.stringify(block.coinbase)
    	)
    	.digest('hex');
}


module.exports = {
	createBlock,
	calculateBlockHash
}