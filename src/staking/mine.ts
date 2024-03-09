import { parentPort, workerData } from "worker_threads";
import crypto from "crypto";

// Function to mine a block with custom logic
function mineBlock() {

	const block = workerData.block;
	const modifyedBlock = workerData.modifyedBlock;

	let stopMining = false;

	if (parentPort == null) return;

	// Listen for messages from the parent thread
	parentPort.on('stopMining', () => {
		stopMining = true;
	});

	function calculateHash() {
		block.hash = crypto
			.createHash('sha256')
			.update(JSON.stringify(modifyedBlock))
			.digest('hex');
	}	

	while (!stopMining) {
		block.nonce = modifyedBlock.nonce = Math.floor(Math.random() * 4294967296).toString(); // Generate a random 32-bit nonce
		calculateHash();

		if (block.hash.substring(0, workerData.mining_difficulty) === '0'.repeat(workerData.mining_difficulty)) {
			parentPort.postMessage({"type": "done", block: block});
			return;
		}
	}
}

mineBlock();
