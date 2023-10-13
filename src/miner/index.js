const { Worker, isMainThread } = require('worker_threads');
const blockMiningUtils = require('./block_mining_utils');
const util = require('../util');
const config = require('../handlers/configHandler');

const data = require('../handlers/dataHandler');

const numberOfThreads = config.miner.number_of_threads; // Adjust this to the number of threads you need.

async function runInMiningParallel() {
	const workerThreads = [];
	let results = new Array(numberOfThreads).fill(null);

	// Create a block to be mined by all threads
	const block = blockMiningUtils.createBlock();

	const promises = Array.from({ length: numberOfThreads }, (_, i) =>
		new Promise((resolve) => {
		const worker = new Worker(util.processRootDirectory + '/src/miner/mine.js', { workerData: { block, threadIndex: i } });
		workerThreads.push(worker);

		worker.on('message', (data) => {
			results[i] = data;
			resolve(data);
		});

		worker.on('error', (error) => {
			// Handle worker errors if needed.
			console.error('Mining Worker Error:', error);
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

	const blockResult = await Promise.race(promises);

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

function afterMiningLogic(blockResult) {
	data.writeBlock(blockResult)
}

if (isMainThread && config.miner.active) {
  main();
}
