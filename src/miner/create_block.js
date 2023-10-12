const crypto = require('crypto');
const data = require('../handlers/dataHandler'); // Import the data-handler module

const mining_difficulty = 6;

// Function to create a new block
function createBlock() {

	data.getLatestBlockInfo

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

// Function to mine a block

// Function to mine a block with verified transactions from the Mempool
function mineBlockWithTransactions(previousBlock) {
  	const verifiedTransactions = dataHandler.mempool.transactions;
  	const newBlock = createBlock(
    	previousBlock,
    	verifiedTransactions,
    	difficulty
  	);

  	// Remove mined transactions from the Mempool
  	for (const transactionHash in verifiedTransactions) {
    	dataHandler.removeTransactionFromMempool(
      	verifiedTransactions[transactionHash]
    	);
  	}

  	return newBlock;
}

// Create a genesis block
const genesisBlock = {
  	index: 0,
  	previousHash: '0',
  	transactions: [],
  	timestamp: new Date().getTime(),
  	nonce: 0,
  	hash: '',
};

// Mine a new block with verified transactions from the Mempool
const newBlock = mineBlockWithTransactions(genesisBlock);

