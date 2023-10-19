const fs = require('fs');
const util = require('../utils.js');
const path = require('path');

let mempool = {
    blocks: {},
    transactions: {}
};

function createStorageIfNotExists() {
    ensureDirectoryExists('/blocks');
    ensureDirectoryExists('/utxos');
    ensureDirectoryExists('/indexes');
    ensureDirectoryExists('/forks');

    ensureFileExists('/indexes/blocks.json', '[]');
    ensureFileExists('/indexes/latestblockinfo.json', '{}');
    ensureFileExists('/indexes/transactions.json', '[]');
}


function getBlockchainDataFilePath(subpath) {
    return path.join(util.processRootDirectory, '/blockchain_data' + subpath);
}

// Function to ensure the existence of a directory
function ensureDirectoryExists(directoryPath) {
    const fullDirectoryPath = getBlockchainDataFilePath(directoryPath);
    try {
        if (!fs.existsSync(fullDirectoryPath)) {
            fs.mkdirSync(fullDirectoryPath, { recursive: true });
            util.data_message.log(`Directory ${directoryPath} was created because it was missing.`);
        }
    } catch (err) {
        util.data_message.error(`Error ensuring the existence of a directory at ${directoryPath}: ${err.message}`);
    }
}

// Function to ensure the existence of a file
function ensureFileExists(filePath, content = '') {
    const fullFilePath = getBlockchainDataFilePath(filePath);
    try {
        const dir = path.dirname(fullFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            util.data_message.log(`Directory ${dir} was created because it was missing.`);
        }
        if (!fs.existsSync(fullFilePath)) {
            fs.writeFileSync(fullFilePath, content, 'utf8');
            util.data_message.log(`File ${filePath} was created because it was missing.`);
        }
    } catch (err) {
        util.data_message.error(`Error ensuring the existence of a file at ${filePath}: ${err.message}`);
    }
}

// Function to check if a file is empty or contains an empty JSON object or array
function isFileNotEmpty(filePath, jsonFormat = '[]') {
    try {
        const content = fs.readFileSync(getBlockchainDataFilePath(filePath), 'utf8');
        let jsonData;
        try {
            jsonData = JSON.parse(content);
        } catch (err) {
            jsonData = JSON.parse(jsonFormat);
            ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
        }

        if (Array.isArray(jsonData)) {
            return jsonData.length > 0;
        } else if (typeof jsonData === 'object') {
            return Object.keys(jsonData).length > 0;
        }
        return false;
    } catch (err) {
        const jsonData = JSON.parse(jsonFormat);
        ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
        return true;
    }
}

// Function to check if a directory is empty
function isDirectoryNotEmpty(directoryPath) {
    try {
        const fullDirectoryPath = getBlockchainDataFilePath(directoryPath);
        const files = fs.readdirSync(fullDirectoryPath);
        return files.length > 0;
    } catch (err) {
        ensureDirectoryExists(directoryPath);
    }
}


// Function to write a block
function writeBlock(blockData) {
    const blockNumber = blockData.index;
    const blockHash = blockData.hash;
    const blockFilePath = getBlockchainDataFilePath(`/blocks/${blockNumber}.json`);
    const blocksListFilePath = getBlockchainDataFilePath('/indexes/blocks.json');

    try {
        // Check if the block file already exists.
        if (!fs.existsSync(blockFilePath)) {
            // Write the block data to the block file.
            fs.writeFileSync(blockFilePath, JSON.stringify(blockData), { encoding: 'utf8', flag: 'w' });
  
            // Update the list of blocks.
            const blocksListData = fs.readFileSync(blocksListFilePath, 'utf8');
            const blocksList = JSON.parse(blocksListData);
            blocksList.push({ hash: blockHash, index: blockNumber });
            fs.writeFileSync(blocksListFilePath, JSON.stringify(blocksList), { encoding: 'utf8', flag: 'w' });

            return { cb: 'success' };
        } else {
            util.data_message.error(`Block ${blockNumber} already exists and cannot be overwritten.`);
            return { cb: 'error' };
        }
    } catch (err) {
        util.data_message.error(`Error writing block ${blockNumber}: ${err.message}.`);
        return { cb: 'error' };
    }
}

// Function to read a block
function readBlock(blockNumber) {
    const blockFilePath = getBlockchainDataFilePath(`/blocks/${blockNumber}.json`);
    try {
        if (fs.existsSync(blockFilePath)) {
            const data = fs.readFileSync(blockFilePath, 'utf8');
            return {cb: "success", data: JSON.parse(data)};
        } else {
            util.data_message.error(`Block ${blockNumber} was not found.`);
            return {cb: 'none'};
        }
    } catch (err) {
        util.data_message.error(`Error reading block ${blockNumber}: ${err.message}.`);
        return {cb: 'error'}
    }
}


// Function to add a block to the Mempool
function addBlockToMempool(blockNumber, blockData) {
    if (mempool.blocks[blockNumber]) {
      util.data_message.error(`Block ${blockNumber} already exists in the Mempool.`);
      return { cb: 'error' };
    }
  
    mempool.blocks[blockNumber] = blockData;
    return { cb: 'success' };
  }
  
  // Function to remove a block from the Mempool
  function removeBlockFromMempool(blockNumber) {
    if (mempool.blocks[blockNumber]) {
      delete mempool.blocks[blockNumber];
      return { cb: 'success' };
    }
  
    util.data_message.error(`Block ${blockNumber} not found in the Mempool.`);
    return { cb: 'error' };
  }
  
  // Function to add a transaction to the Mempool
  function addTransactionToMempool(transaction) {
    const transactionHash = transaction.txid;
  
    if (mempool.transactions[transactionHash]) {
      util.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
      return { cb: 'error' };
    }
  
    mempool.transactions[transactionHash] = transaction;
    return { cb: 'success' };
  }
  
  // Function to remove a transaction from the Mempool
  function removeTransactionFromMempool(transaction) {
    const transactionHash = transaction.txid;
  
    if (mempool.transactions[transactionHash]) {
      delete mempool.transactions[transactionHash];
      return { cb: 'success' };
    }
  
    util.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
    return { cb: 'error' };
  }

// Function to write a transaction
function writeTransaction(txID, transactionData) {
    const txFilePath = getBlockchainDataFilePath(`/transactions/${txID}.json`);
    try {
        if (!fs.existsSync(txFilePath)) {
            fs.writeFileSync(txFilePath, JSON.stringify(transactionData, null, 2));
            success
        } else {
            util.data_message.error(`Transaktion ${txID} already exists and cannot be overwritten.`);
            return {cb: 'error'}
        }
    } catch (err) {
        util.data_message.error(`Error writing transaction ${txID}: ${err.message}`);
        return {cb: 'error'}
    }
}

// Function to read a transaction
function readTransaction(txID) {
    const txFilePath = getBlockchainDataFilePath(`/transactions/${txID}.json`);
    try {
        if (fs.existsSync(txFilePath)) {
            const data = fs.readFileSync(txFilePath, 'utf8');
            return {cb: 'success', data: JSON.parse(data)}
        } else {
            util.data_message.error(`Transaktion ${txID} was not found`);
            return {cb: 'none'}
        }
    } catch (err) {
        util.data_message.error(`Error reading transaction ${txID}: ${err.message}`);
        return {cb: 'error'}
    }
}

// Function to write a UTXO
function addUTXO(transactionData) {
    const txFilePath = getBlockchainDataFilePath(`/utxos/${txID}.json`);
    try {
        if (!fs.existsSync(txFilePath)) {
            fs.writeFileSync(txFilePath, JSON.stringify(transactionData, null, 2));
            success
        } else {
            util.data_message.error(`Transaktion ${txID} already exists and cannot be overwritten.`);
            return {cb: 'error'}
        }
    } catch (err) {
        util.data_message.error(`Error writing transaction ${txID}: ${err.message}`);
        return {cb: 'error'}
    }
}

// Function to read a UTXO
function readUTXOS(transactionData) {
    const txFilePath = getBlockchainDataFilePath(`/utxos/${txID}.json`);
    try {
        if (fs.existsSync(txFilePath)) {
            const data = fs.readFileSync(txFilePath, 'utf8');
            return {cb: 'success', data: JSON.parse(data)}
        } else {
            util.data_message.error(`Transaktion ${txID} was not found`);
            return {cb: 'none'}
        }
    } catch (err) {
        util.data_message.error(`Error reading transaction ${txID}: ${err.message}`);
        return {cb: 'error'}
    }
}

// Function to remove a UTXO
function removeUTXO(transactionData) {
    const txFilePath = getBlockchainDataFilePath(`/utcos/${txID}.json`);
    try {
        if (fs.existsSync(txFilePath)) {
            const data = fs.readFileSync(txFilePath, 'utf8');
            return {cb: 'success', data: JSON.parse(data)}
        } else {
            util.data_message.error(`Transaktion ${txID} was not found`);
            return {cb: 'none'}
        }
    } catch (err) {
        util.data_message.error(`Error reading transaction ${txID}: ${err.message}`);
        return {cb: 'error'}
    }
}

function getLatestBlockInfo() {
    const latestBlockInfoFilePath = getBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
    try {
        const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
        return {cb: 'success', data: JSON.parse(data)}
    } catch (err) {
        util.data_message.error(`Error reading latest block info: ${err.message}`);
        return {cb: 'error'}
    }
}

function updateLatestBlockInfo(index, hash) {
    const latestBlockInfoFilePath = getBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
    try {
        const data = {
            hash: hash,
            index: index,
        }
        fs.writeFileSync(latestBlockInfoFilePath, JSON.stringify(data), {encoding:'utf8',flag:'w'});
        return {cb: 'success'};
    } catch (err) {
        util.data_message.error(`Error writing latest block info: ${err.message}`);
        return {cb: 'error'};
    }
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
        util.data_message.error(`Error reading latest block info: ${err.message}`);
        return { cb: 'error' };
    }
}

function isGenesisBlock() {
    const blocksDirectory = '/blocks';
    const latestBlockInfoFile = '/indexes/latestblockinfo.json';
    const blocksIndexFile = '/indexes/blocks.json';
  
    try {
        const blocksExist = isDirectoryNotEmpty(blocksDirectory);
        const latestBlockInfoExists = fs.existsSync(latestBlockInfoFile);
        const blocksIndexFileExists = fs.existsSync(blocksIndexFile);
    
        const isLatestBlockInfoEmpty = isFileNotEmpty(latestBlockInfoFile);
        const isBlocksIndexEmpty = isFileNotEmpty(blocksIndexFile);
    
        // Check if all conditions are true
        if (blocksExist || latestBlockInfoExists || blocksIndexFileExists || isLatestBlockInfoEmpty || isBlocksIndexEmpty) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        util.data_message.error(`Error checking for existing blocks: ${err.message}`);
        return false;
    }
}

function readBlockInForks(index, hash) {

    const forksDirectory = getBlockchainDataFilePath('/forks/');

    try {
        const forksFolders = fs.readdirSync(forksDirectory);
    
        for (const folder of forksFolders) {
            const folderPath = path.join(forksDirectory, folder);
            const blocksFolder = path.join(folderPath, 'blocks');
        
            if (fs.existsSync(blocksFolder)) {
                const blockFilePath = path.join(blocksFolder, `${index}.json`);
        
                if (fs.existsSync(blockFilePath)) {
                const blockData = JSON.parse(fs.readFileSync(blockFilePath, 'utf-8'));
        
                    if (blockData.hash === hash) {
                        // Found a block with matching index and hash
                        return {cb: "success", data: blockData};
                    }
                }
            }
        }
    
        // Block not found in any fork
        return {cb: "none"};
    } catch (err) {
        console.error(`Error reading Block ${index} ${hash} in Forks: ${err.message}`);
        return {cb: "error"};
    }
}

module.exports = {
    mempool,
    writeBlock,
    readBlock,
    addBlockToMempool,
    removeBlockFromMempool,
    addTransactionToMempool,
    removeTransactionFromMempool,
    removeBlockFromMempool,
    writeTransaction,
    readTransaction,
    getLatestBlockInfo,
    updateLatestBlockInfo,
    existsBlock,
    isGenesisBlock,
    ensureDirectoryExists,
    ensureFileExists,
    createStorageIfNotExists,
    readBlockInForks
}