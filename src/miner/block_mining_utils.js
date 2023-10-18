const crypto = require('crypto');
const data = require('../handlers/dataHandler'); // Import the data-handler module
const config = require('../handlers/configHandler');

// Function to create a new block
function createBlock() {

	previousBlock = data.getLatestBlockInfo().data;

	let newIndex;
	let previousHash;

	if (previousBlock === undefined || (typeof(previousBlock.index) !== 'number')) newIndex = 0;
	else newIndex = previousBlock.index + 1;

	if (previousBlock === undefined || (typeof(previousBlock.hash) !== 'string')) previousHash = '';
	else previousHash = previousBlock.hash;

    const newBlock = {
      	index: newIndex,
		previousHash: previousHash,
		transactions: data.mempool.transactions,
		timestamp: new Date().getTime(),
		nonce: 0,
		coinbase: {
			minerAdress: config.miner.minerAddress,
			amount: 50
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

// Function to mine a block with verified transactions from the Mempool
function removeAddedTransactions(block) {

  	for (let [transactionHash, transactionData] of Object.entries(block.transactions)) {
    	data.removeTransactionFromMempool(transactionData);
  	}
}


module.exports = {
	createBlock,
	calculateBlockHash,
	removeAddedTransactions,
}