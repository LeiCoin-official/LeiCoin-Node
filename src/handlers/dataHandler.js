const fs = require('fs');
const util = require('../util.js');
const path = require('path');

let mempool = {
    blocks: {},
    transactions: {}
};

function getBlockchainDataFilePath(subpath) {
    return path.join(util.processRootDirectory, '/blockchain_data' + subpath);
}


// Function to write a block
function writeBlock(blockData) {
    const blockNumber = blockData.index;
    const blockFilePath = getBlockchainDataFilePath(`/blocks/${blockNumber}.json`);
    try {
        if (!fs.existsSync(blockFilePath)) {
            fs.writeFileSync(blockFilePath, JSON.stringify(blockData));
            return {cb: 'success'}
        } else {
            console.error(`Block ${blockNumber} already exists and cannot be overwritten.`);
            return {cb: 'error'}
        }
    } catch (err) {
        console.error(`Error writing block ${blockNumber}: ${err.message}.`);
        return {cb: 'error'}
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
            console.error(`Block ${blockNumber} was not found.`);
            return {cb: 'none'};
        }
    } catch (err) {
        console.error(`Error reading block ${blockNumber}: ${err.message}.`);
        return {cb: 'error'}
    }
}


// Function to add a block to the Mempool
function addBlockToMempool(blockNumber, blockData) {
    if (mempool.blocks[blockNumber]) {
      console.error(`Block ${blockNumber} already exists in the Mempool.`);
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
  
    console.error(`Block ${blockNumber} not found in the Mempool.`);
    return { cb: 'error' };
  }
  
  // Function to add a transaction to the Mempool
  function addTransactionToMempool(transaction) {
    const transactionHash = transaction.txid;
  
    if (mempool.transactions[transactionHash]) {
      console.error(`Transaction ${transactionHash} already exists in the Mempool.`);
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
  
    console.error(`Transaction ${transactionHash} not found in the Mempool.`);
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
            console.error(`Transaktion ${txID} already exists and cannot be overwritten.`);
            return {cb: 'error'}
        }
    } catch (err) {
        console.error(`Error writing transaction ${txID}: ${err.message}`);
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
            console.error(`Transaktion ${txID} was not found`);
            return {cb: 'none'}
        }
    } catch (err) {
        console.error(`Error reading transaction ${txID}: ${err.message}`);
        return {cb: 'error'}
    }
}

function getLatestBlockInfo() {
    const latestBlockInfoFilePath = getBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
    try {
        const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
        return {cb: 'success', data: JSON.parse(data)}
    } catch (err) {
        console.error(`Error reading latest block info: ${err.message}`);
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
        fs.writeFileSync(latestBlockInfoFilePath, JSON.stringify(data));
        return {cb: 'success'};
    } catch (err) {
        console.error(`Error writing latest block info: ${err.message}`);
        return {cb: 'error'};
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
    updateLatestBlockInfo
}