const crypto = require('crypto');
const data = require('../handlers/dataHandler'); // Import the data-handler module

const mining_difficulty = 6;

// Function to create a new block
function createBlock() {

	previousBlock = data.getLatestBlockInfo();

	let newIndex;
	let previousHash;

	if (previousBlock.index == NaN) newIndex = 0;
	else newIndex = previousBlock.index;

	if (previousBlock.hash == undefined) previousHash = '';
	else previousHash = previousBlock.hash;

    const newBlock = {
      	index: newIndex,
		previousHash: previousHash,
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