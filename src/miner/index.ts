import { Worker, isMainThread } from "worker_threads";
import Block from "../objects/block.js";
import utils from "../utils.js";
import config from "../handlers/configHandler.js";
import validation from "../validation.js";
import blockchain from "../handlers/storage/blockchain.js";

const numberOfThreads = config.miner.number_of_threads; // Adjust this to the number of threads you need.

async function runInMiningParallel(): Promise<{ results: any[]; blockResult: Block | null }> {
	const workerThreads: Worker[] = [];
	let results = new Array(numberOfThreads).fill(null);

	const promises = Array.from({ length: numberOfThreads }, (_, i) =>
		new Promise<Block | null>((resolve) => {
			const worker = new Worker(utils.processRootDirectory + '/src/miner/mine.js', { workerData: { threadIndex: i } });
			workerThreads.push(worker);

			worker.on('message', (data) => {
				utils.miner_message.log(`Miner mined block with hash ${data.hash}. Waiting for verification`);
				results[i] = data;
				resolve(data);
			});

			worker.on('error', (error) => {
				// Handle worker errors if needed.
				utils.miner_message.error('Mining Worker Error:', error);
				resolve(null);
			});

			worker.on('exit', (code) => {
				// if (code !== 0) {
				//   console.error(`Mining Worker ${i} exited with code ${code}`);
				//   resolve(null);
				// }
				resolve(null);
			});
		})
	);
	
	const blockResult = await Promise.race<Block | null>(promises);

	// Terminate all worker threads.
	for (const worker of workerThreads) {
		worker.terminate();
	}

	return { results, blockResult };
}

async function main() {

	while (true) {
		const { results, blockResult } = await runInMiningParallel();

		if (blockResult !== null) {
			const winnerIndex = results.findIndex((result) => result === blockResult);
			afterMiningLogic(blockResult);
		}

		// Sleep for a while before starting the next iteration.
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the delay as needed.
	}
}

function afterMiningLogic(blockResult: Block) {
	if (validation.isValidBlock(blockResult).cb) {

		blockchain.addBlock(blockResult);
		blockchain.updateLatestBlockInfo(blockResult.index, blockResult.hash);
		blockchain.clearMempool(blockResult);

		blockchain.addUTXOS({txid: blockResult.hash, index: 0, recipientAddress: blockResult.coinbase.minerAddress, amount: blockResult.coinbase.amount}, true);

		for (const [, transactionData] of Object.entries(blockResult.transactions)) {
			blockchain.deleteUTXOS(transactionData);
			blockchain.addUTXOS(transactionData, false);
		}

		utils.events.emit('block_receive', JSON.stringify({type: "block", data: blockResult}));

		utils.miner_message.success(`Mined block with hash ${blockResult.hash} has been validated. Broadcasting now.`);
	} else {
		utils.miner_message.error(`Mined block with hash ${blockResult.hash} is invalid.`);
	}
}

if (isMainThread && config.miner.active) {
  	main();
}
