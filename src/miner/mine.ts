import Block from "../objects/block.js";
import { parentPort, workerData } from "worker_threads";
import utils from "../utils.js";
import cryptoHandlers from "../handlers/cryptoHandlers.js";

// Function to mine a block with custom logic
function mineBlock() {

	const block = Block.createNewBlock();
	const modifyedBlock = cryptoHandlers.getPreparedObjectForHashing(block, ["hash"]);

	let stopMining = false;

	if (parentPort == null) return;

	// Listen for messages from the parent thread
	parentPort.on('stopMining', () => {
		stopMining = true;
	});

	while (!stopMining) {
		block.nonce = modifyedBlock.nonce = Math.floor(Math.random() * 4294967296); // Generate a random 32-bit nonce
		block.calculateHash(modifyedBlock);

		if (block.hash.substring(0, utils.mining_difficulty) === '0'.repeat(utils.mining_difficulty)) {
			parentPort.postMessage({"type": "done", block: block});
			return;
		}
	}
}

mineBlock();
