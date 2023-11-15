const { parentPort, workerData } = require('worker_threads');
const blockMiningUtils = require('./block_mining_utils');
const util = require('../utils');

const { block, threadIndex } = workerData;

// Function to mine a block with custom logic
function mineBlock(block) {
	let stopMining = false;

	// Listen for messages from the parent thread
	parentPort.on('message', (message) => {
		if (message === 'stopMining') {
			console.log(`Thread ${threadIndex} received stop signal. Stopping mining.`);
			stopMining = true;
		}
		// Add more logic to handle other messages from the parent thread if needed
	});

	while (!stopMining) {
		block.nonce = Math.floor(Math.random() * 4294967296); // Generate a random 32-bit nonce
		block.hash = blockMiningUtils.calculateBlockHash(block);

		if (block.hash.substring(0, util.mining_difficulty) === '0'.repeat(util.mining_difficulty)) {
			parentPort.postMessage({ result: block, threadIndex });
			return;
		}
	}
}

console.log(`Thread ${threadIndex} is mining a block`);
mineBlock(block);
