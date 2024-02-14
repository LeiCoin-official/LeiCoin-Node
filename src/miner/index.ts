import { Worker } from "worker_threads";
import Block from "../objects/block.js";
import utils from "../utils.js";
import config from "../handlers/configHandler.js";
import validation from "../validation.js";
import blockchain from "../handlers/storage/blockchain.js";
import mempool from "../handlers/storage/mempool.js";

const numberOfThreads = config.miner.number_of_threads; // Adjust this to the number of threads you need.

async function runInMiningParallel(): Promise<Block | null> {
	const workerThreads: Worker[] = [];
	//let results = new Array(numberOfThreads).fill(null);

	const promises = Array.from({ length: numberOfThreads }, (_, i) =>
		new Promise<Block | null>((resolve) => {
			const worker = new Worker(utils.processRootDirectory + '/src/miner/mine.js', { workerData: { threadIndex: i } });
			workerThreads.push(worker);

			worker.on('message', (data) => {
				switch (data.type) {
					case "done":
						utils.miner_message.log(`Mined block with hash ${data.block.hash}. Waiting for verification`);
						//results[i] = data;
						resolve(data.block);
						break;
					case "message":
						utils.miner_message.log(data.message);
						break;
				}
			});

			worker.on('error', (error) => {
				// Handle worker errors if needed.
				utils.miner_message.error(`Worker Error: ${error}`);
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

	utils.miner_message.log(`Started mining new Block with ${numberOfThreads} Threads`);
	
	const blockResult = await Promise.race<Block | null>(promises);

	// Terminate all worker threads.
	for (const worker of workerThreads) {
		worker.terminate();
	}

	//return { results, blockResult };
	return blockResult;
}

function afterMiningLogic(blockResult: Block) {
	if (validation.isValidBlock(blockResult).cb) {

		blockchain.addBlock(blockResult);
		blockchain.updateLatestBlockInfo("main", blockResult, blockResult);
		mempool.clearMempoolbyBlock(blockResult);

		blockchain.addUTXOS({txid: blockResult.hash, index: 0, recipientAddress: blockResult.coinbase.minerAddress, amount: blockResult.coinbase.amount}, true);

		for (const [, transactionData] of Object.entries(blockResult.transactions)) {
			blockchain.deleteUTXOS(transactionData);
			blockchain.addUTXOS(transactionData, false);
		}

		utils.events.emit('block_receive', blockResult);

		utils.miner_message.success(`Mined block with hash ${blockResult.hash} has been validated. Broadcasting now.`);
	} else {
		utils.miner_message.error(`Mined block with hash ${blockResult.hash} is invalid.`);
	}
}

async function runMinerCycle() {

	while (true) {
		//const { results, blockResult } = await runInMiningParallel();
		const blockResult = await runInMiningParallel();

		if (blockResult !== null) {
			afterMiningLogic(blockResult);
		}

		// Sleep for a while before starting the next iteration.
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the delay as needed.
	}
}

export default async function initMinerIfActive() {
	if (config.miner.active) {
		runMinerCycle();
		utils.miner_message.log("Miner started");   
	}
}
