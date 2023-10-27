const fs = require('fs');
const util = require('../utils.js');
const path = require('path');

let mempool = {
    transactions: {},
    deleted_utxos: [],
    added_utxos: []
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

  
// Function to add a transaction to the Mempool
function addTransactionToMempool(transaction) {
    const transactionHash = transaction.txid;
  
    if (mempool.transactions[transactionHash]) {
        //util.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
        return { cb: 'exists' };
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
  
    //util.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
    return { cb: 'none' };
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
        return {cb: 'error'};
    }
}

// Function to write a UTXO
function addUTXOS(transactionData, coinbase = false) {

    function writeUTXO(output, txid) {
        try {

            const recipientAddress = output.recipientAddress;

            const directoryPath = `/utxos/${recipientAddress.slice(0, 2)}`;
            const filePath = `${recipientAddress.slice(2, 4)}.json`;
    
            // Ensure the existence of the directory and file for the recipient
            ensureFileExists(`${directoryPath}/${filePath}`, '{}');

            // Read existing UTXOs from the recipient's file
            const fullFilePath = getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
            const existingData = fs.readFileSync(fullFilePath, 'utf8');
            const existingUTXOs = JSON.parse(existingData);

            if (!existingUTXOs[recipientAddress]) existingUTXOs[recipientAddress] = [];

            // Add UTXOs to the recipient's file
            existingUTXOs[recipientAddress].push({
                txid: txid,
                index: output.index,
                amount: output.amount
            });

                // Write the updated UTXOs back to the recipient's file
            fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2));
        } catch (err) {
            util.data_message.error(`Error writing UTXOs for recipient address ${recipientAddress}: ${err.message}`);
            return { cb: 'error' };
        }
    }

    if (coinbase) {

        writeUTXO(transactionData, transactionData.txid);

    } else {
        // Iterate through the recipients in the output array
        for (const output of transactionData.output) {
            writeUTXO(output, transactionData.txid);
        }
    }

    return { cb: 'success' };
}

// Function to read a UTXO
function readUTXOS(recipientAddress, txid = null, index = null) {

    try {

        const directoryPath = `/utxos/${recipientAddress.slice(0, 2)}`;
        const filePath = `${recipientAddress.slice(2, 4)}.json`;

        // Check if the UTXO file for the address exists
        const fullFilePath = getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
        if (fs.existsSync(fullFilePath)) {
            const existingData = fs.readFileSync(fullFilePath, 'utf8');
            const existingUTXOs = JSON.parse(existingData);

            if (!existingUTXOs[recipientAddress]) {
                return { cb: 'none'};
            }

            if (txid === null && index === null) {
                return { cb: 'success', data: existingUTXOs[recipientAddress] };
            }

            if (txid && index !== null) {
                const utxo = existingUTXOs[recipientAddress].find(
                    (u) => u.txid === txid && u.index === index
                );

                if (utxo) {
                    return { cb: 'success', data: utxo };
                }
            }

            return { cb: 'none'};
        } else {
            return { cb: 'none'};
        }
    } catch (err) {
        util.data_message.error(`Error reading UTXOs for recipient address ${recipientAddress}: ${err.message}`);
        return { cb: 'error' };
    }
}


// Function to delete a UTXO
function deleteUTXOS(transactionData) {

    try {

        const senderAddress = transactionData.senderAddress;

        const directoryPath = `/utxos/${senderAddress.slice(0, 2)}`;
        const filePath = `${senderAddress.slice(2, 4)}.json`;

        // Check if the UTXO file for the address exists
        const fullFilePath = getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
        if (fs.existsSync(fullFilePath)) {
            const existingData = fs.readFileSync(fullFilePath, 'utf8');
            const existingUTXOs = JSON.parse(existingData);

            if (!existingUTXOs[senderAddress]) {
                return { cb: 'none' };
            }

            for (const input of transactionData.input) {

                // Find the UTXO to delete
                const utxoIndex = existingUTXOs[senderAddress].findIndex(
                    (u) => u.txid === input.txid && u.index === input.index
                );

                if (utxoIndex !== -1) {
                    // Remove the UTXO from the array
                    existingUTXOs[senderAddress].splice(utxoIndex, 1);

                }
            }

            // Update the UTXO file
            fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2), 'utf8');

            return { cb: 'success' };
            
        }

        return { cb: 'none' };
    } catch (err) {
        util.data_message.error(`Error deleting UTXO for recipient address ${recipientAddress}: ${err.message}`);
        return { cb: 'error' };
    }
}


// Function to add a utxo to the list of deleted utxos of the Mempool
function addDeletedUTXOToMempool(utxo) {

    if (mempool.deleted_utxos.includes(utxo)) {
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of deleted utxos in the Mempool.`);
        return { cb: 'exists' };
    }
  
    mempool.deleted_utxos.push(utxo);
    return { cb: 'success' };
}
  
  // Function to remove a utxo from the list of deleted utxos of the Mempool
function removeDeletedUTXOFromMempool(utxo) {

    if (mempool.deleted_utxos.includes(utxo)) {
        const utxoIndex = mempool.deleted_utxos.findIndex(
            (u) => u.txid === input.txid && u.index === input.index
        );
        mempool.deleted_utxos.splice(utxoIndex, 1);
        return { cb: 'success' };
    }
  
    //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of deleted utxos in the Mempool.`);
    return { cb: 'none' };
}

// Function to add a utxo to the list of added utxos of the Mempool
function addAddedUTXOToMempool(utxo) {

    if (mempool.added_utxos.includes(utxo)) {
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of added utxos in the Mempool.`);
        return { cb: 'exists' };
    }
  
    mempool.added_utxos.push(utxo);
    return { cb: 'success' };
}
  
  // Function to remove a utxo from the list of added utxo of the Mempool
function removeAddedUTXOFromMempool(utxo) {

    if (mempool.added_utxos.includes(utxo)) {
        const utxoIndex = mempool.added_utxos.findIndex(
            (u) => u.txid === input.txid && u.index === input.index
        );
        mempool.added_utxos.splice(utxoIndex, 1);
        return { cb: 'success' };
    }
  
    //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of added utxos in the Mempool.`);
    return { cb: 'none' };
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
        util.data_message.error(`Error reading Block ${index} ${hash} in Forks: ${err.message}`);
        return {cb: "error"};
    }
}


// Function to mine a block with verified transactions from the Mempool
function clearMempool(block) {

    for (const [transactionHash, transactionData] of Object.entries(block.transactions)) {
        removeTransactionFromMempool(transactionData);
        for (const input of transactionData.input) {
            removeDeletedUTXOFromMempool(input);
        }
        for (const output of transactionData.output) {
            removeAddedUTXOFromMempool(output);
        }
    }
}

module.exports = {
    mempool,
    writeBlock,
    readBlock,
    addTransactionToMempool,
    removeTransactionFromMempool,
    readTransaction,
    getLatestBlockInfo,
    updateLatestBlockInfo,
    existsBlock,
    isGenesisBlock,
    ensureDirectoryExists,
    ensureFileExists,
    createStorageIfNotExists,
    readBlockInForks,
    addUTXOS,
    deleteUTXOS,
    readUTXOS,
    addDeletedUTXOToMempool,
    removeDeletedUTXOFromMempool,
    addAddedUTXOToMempool,
    removeAddedUTXOFromMempool,
    clearMempool
}