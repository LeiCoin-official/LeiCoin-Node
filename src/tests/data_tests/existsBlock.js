const fs = require('fs');
//const util = require('../utils.js');
const path = require('path');

function getBlockchainDataFilePath(subpath) {
    return path.join('../blockchain_data' + subpath);
}

// Define the function to check if a block with a specific hash and index exists.
function existsBlock(blockHash, blockIndex) {
    try {
        const latestBlockInfoFilePath = getBlockchainDataFilePath('/indexes/blocks.json');
        const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
        const blockArray = JSON.parse(data);
    
        // Check if an object with the specified index and hash exists in the array.
        const block = blockArray.find(block => block.index === blockIndex && block.hash === blockHash);

        if (block) {
            // The block with the specified index and hash exists in the main chain
            return { cb: 'success', exists: true};
        } else {
            // Check if there's a block with the specified index and a different hash in the provided JSON data
            const forkedBlock = blockArray.find(block => block.index === blockIndex && block.hash !== blockHash);
            if (forkedBlock) {
                // The block with the same index but a different hash exists in the provided data
                return { cb: 'success', exists: false, fork: true };
            }
            
            // The block with the specified index and hash does not exist
            return { cb: 'success', exists: false, fork: false };
        }
    } catch (err) {
        console.error(`Error reading latest block info: ${err.message}`);
        return { cb: 'error' };
    }
}

let blocksExist = existsBlock("123456", 14);
console.log(blocksExist);

if (blocksExist.cb === "success" && !blocksExist.exists && !blocksExist.fork) {
    console.log(true);
} else {
    console.log(false);
}