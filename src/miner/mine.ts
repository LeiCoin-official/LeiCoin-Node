import Block from "../objects/block.js";
import { parentPort, workerData } from "worker_threads";
import utils from "../utils.js";
import cryptoHandlers from "../handlers/cryptoHandlers.js";

const { threadIndex } = workerData;

// Function to mine a block with custom logic
function mineBlock() {

	const block = Block.createNewBlock();
	const modifyedBlock = cryptoHandlers.getPreparedObjectForHashing(block, ["hash"]);

	let stopMining = false;

	if (parentPort == null) return;

	// Listen for messages from the parent thread
	parentPort.on('message', (message) => {
		if (message === 'stopMining') {
			console.log(`Thread ${threadIndex} received stop signal. Stopping mining.`);
			stopMining = true;
		}
		// Add more logic to handle other messages from the parent thread if needed
	});

	while (!stopMining) {
		block.nonce = modifyedBlock.nonce = Math.floor(Math.random() * 4294967296); // Generate a random 32-bit nonce
		block.calculateHash(modifyedBlock);

		if (block.hash.substring(0, utils.mining_difficulty) === '0'.repeat(utils.mining_difficulty)) {
			parentPort.postMessage({ result: block, threadIndex });
			return;
		}
	}
}

utils.miner_message.log(`Thread ${threadIndex} is mining a block`);
mineBlock();
