const { parentPort, workerData } = require('worker_threads');
const blockMiningUtils = require('./block_mining_utils');

const { block, threadIndex } = workerData;
const mining_difficulty = 6; // Adjust the desired difficulty here

// Function to mine a block with custom logic
function mineBlock(block) {
  while (true) {
    block.nonce = Math.floor(Math.random() * 4294967296); // Generate a random 32-bit nonce
    block.hash = blockMiningUtils.calculateBlockHash(block);

    if (block.hash.substring(0, mining_difficulty) === '0'.repeat(mining_difficulty)) {
      return block;
    }
  }
}

console.log(`Thread ${threadIndex} is mining a block`);
const minedBlock = mineBlock(block);

// Check if the mined block is valid
// if (blockMiningUtils.isValidBlock(minedBlock)) {
//   parentPort.postMessage(`Thread ${threadIndex} mined a valid block with hash: ${minedBlock.hash}`);
// } else {
//   parentPort.postMessage(null); // Indicate that this thread did not find a valid block
// }

parentPort.postMessage(block);