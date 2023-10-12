const crypto = require('crypto');
const data = require('../handlers/dataHandler'); // Import the data-handler module

const mining_difficulty = 10;

// Function to create a new block
function createBlock() {

	previousBlock = data.getLatestBlockInfo();

    const newBlock = {
      	index: previousBlock.index + 1,
		previousHash: previousBlock.hash,
		transactions: data.mempool.transactions,
		timestamp: new Date().getTime(),
		nonce: 0,
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
        	block.nonce
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