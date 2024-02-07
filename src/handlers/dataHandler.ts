import fs from "fs";
import utils from "../utils.js";
import path from "path";

function createStorageIfNotExists() {
    ensureDirectoryExists('/blocks');
    ensureDirectoryExists('/utxos');
    ensureDirectoryExists('/indexes');
    ensureDirectoryExists('/forks');

    ensureFileExists('/indexes/blocks.json', '[]');
    ensureFileExists('/indexes/latestblockinfo.json', '{}');
    ensureFileExists('/indexes/transactions.json', '[]');
}


function getBlockchainDataFilePath(subpath: string) {
    return path.join(utils.processRootDirectory, '/blockchain_data' + subpath);
}

// Function to ensure the existence of a directory
function ensureDirectoryExists(directoryPath: string) {
    const fullDirectoryPath = getBlockchainDataFilePath(directoryPath);
    try {
        if (!fs.existsSync(fullDirectoryPath)) {
            fs.mkdirSync(fullDirectoryPath, { recursive: true });
            utils.data_message.log(`Directory ${directoryPath} was created because it was missing.`);
        }
    } catch (err: any) {
        utils.data_message.error(`Error ensuring the existence of a directory at ${directoryPath}: ${err.message}`);
    }
}

// Function to ensure the existence of a file
function ensureFileExists(filePath: string, content = '') {
    const fullFilePath = getBlockchainDataFilePath(filePath);
    try {
        const dir = path.dirname(fullFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            utils.data_message.log(`Directory ${dir} was created because it was missing.`);
        }
        if (!fs.existsSync(fullFilePath)) {
            fs.writeFileSync(fullFilePath, content, 'utf8');
            utils.data_message.log(`File ${filePath} was created because it was missing.`);
        }
    } catch (err: any) {
        utils.data_message.error(`Error ensuring the existence of a file at ${filePath}: ${err.message}`);
    }
}

// Function to check if a file is empty or contains an empty JSON object or array
function isFileNotEmpty(filePath: any, jsonFormat = '[]') {
    try {
        const content = fs.readFileSync(getBlockchainDataFilePath(filePath), 'utf8');
        let jsonData;
        try {
            jsonData = JSON.parse(content);
        } catch (err: any) {
            jsonData = JSON.parse(jsonFormat);
            ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
        }

        if (Array.isArray(jsonData)) {
            return jsonData.length > 0;
        } else if (typeof jsonData === 'object') {
            return Object.keys(jsonData).length > 0;
        }
        return false;
    } catch (err: any) {
        const jsonData = JSON.parse(jsonFormat);
        ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
        return true;
    }
}

// Function to check if a directory is empty
function isDirectoryNotEmpty(directoryPath: any) {
    try {
        const fullDirectoryPath = getBlockchainDataFilePath(directoryPath);
        const files = fs.readdirSync(fullDirectoryPath);
        return files.length > 0;
    } catch (err: any) {
        ensureDirectoryExists(directoryPath);
    }
}

// Function to read a transaction
function readTransaction(txID: any) {
    const txFilePath = getBlockchainDataFilePath(`/transactions/${txID}.json`);
    try {
        if (fs.existsSync(txFilePath)) {
            const data = fs.readFileSync(txFilePath, 'utf8');
            return {cb: 'success', data: JSON.parse(data)}
        } else {
            utils.data_message.error(`Transaktion ${txID} was not found`);
            return {cb: 'none'}
        }
    } catch (err: any) {
        utils.data_message.error(`Error reading transaction ${txID}: ${err.message}`);
        return {cb: 'error'};
    }
}

// Function to write a UTXO
function addUTXOS(transactionData: { txid: any; output?: any; recipientAddress?: any; index?: any; amount?: any; }, coinbase = false) {

    function writeUTXO(output: {recipientAddress: any; index: any; amount: any; }, txid: any) {
        const recipientAddress = output.recipientAddress;
        try {

            const directoryPath = `/utxos/${recipientAddress.slice(0, 2)}`;
            const filePath = `${recipientAddress.slice(2, 4)}.json`;
    
            // Ensure the existence of the directory and file for the recipient
            ensureFileExists(`${directoryPath}/${filePath}`, '{}');

            // Read existing UTXOs from the recipient's file
            const fullFilePath = getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
            const existingData = fs.readFileSync(fullFilePath, 'utf8');
            const existingUTXOs = JSON.parse(existingData);

            if (!existingUTXOs[recipientAddress]) existingUTXOs[recipientAddress] = {};

            // Add UTXOs to the recipient's file
            existingUTXOs[recipientAddress][`${txid}_${output.index}`] = {
                amount: output.amount
            };

            // Write the updated UTXOs back to the recipient's file
            fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2));
        } catch (err: any) {
            utils.data_message.error(`Error writing UTXOs for recipient address ${recipientAddress}: ${err.message}`);
            return { cb: 'error' };
        }
    }

    if (coinbase) {

        const coinbaseData = {
            recipientAddress: transactionData.recipientAddress,
            index: transactionData.index,
            amount: transactionData.amount
        };
        writeUTXO(coinbaseData, transactionData.txid);

    } else {
        // Iterate through the recipients in the output array
        for (const output of transactionData.output) {
            writeUTXO(output, transactionData.txid);
        }
    }

    return { cb: 'success' };
}

// Function to read a UTXO
function readUTXOS(recipientAddress: string, txid = null, index = null, includeMempool = true) {

    try {

        const directoryPath = `/utxos/${recipientAddress.slice(0, 2)}`;
        const filePath = `${recipientAddress.slice(2, 4)}.json`;

        // Check if the UTXO file for the address exists
        const fullFilePath = getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
        if (fs.existsSync(fullFilePath)) {
            const existingData = fs.readFileSync(fullFilePath, 'utf8');
            const existingUTXOs = JSON.parse(existingData);

            if (includeMempool) {
                if (mempool.deleted_utxos[recipientAddress]) {
                    for (const deleted_utxo of mempool.deleted_utxos[recipientAddress]) {
                        delete existingUTXOs[recipientAddress][deleted_utxo];
                    }
                }
                if (mempool.added_utxos[recipientAddress]) {
                    for (const [added_utxo, added_utxo_content] of Object.entries(mempool.added_utxos[recipientAddress])) {
                        existingUTXOs[recipientAddress][added_utxo] = added_utxo_content;
                    }
                }
            }

            if (!existingUTXOs[recipientAddress]) {
                return { cb: 'none'};
            }

            if (txid === null && index === null) {
                return { cb: 'success', data: existingUTXOs[recipientAddress] };
            }

            if (txid && index !== null) {
                const utxo = existingUTXOs[recipientAddress][`${txid}_${index}`];
            
                if (utxo) {
                    return { cb: 'success', data: utxo };
                }
            }

            return { cb: 'none'};
        } else {
            return { cb: 'none'};
        }
    } catch (err: any) {
        utils.data_message.error(`Error reading UTXOs for recipient address ${recipientAddress}: ${err.message}`);
        return { cb: 'error' };
    }
}


// Function to delete a UTXO
function deleteUTXOS(transactionData: { senderAddress: any; input: any; }) {

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
                const utxoKey = `${input.txid}_${input.index}`;
                if (existingUTXOs[senderAddress][utxoKey]) {
                    // Remove the UTXO from the object
                    delete existingUTXOs[senderAddress][utxoKey];
                }
            }

            // Update the UTXO file
            fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2), 'utf8');

            return { cb: 'success' };
            
        }

        return { cb: 'none' };
    } catch (err: any) {
        utils.data_message.error(`Error deleting UTXO: ${err.message}`);
        return { cb: 'error' };
    }
}


function getLatestBlockInfo() {
    const latestBlockInfoFilePath = getBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
    try {
        const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
        return {cb: 'success', data: JSON.parse(data)}
    } catch (err: any) {
        utils.data_message.error(`Error reading latest block info: ${err.message}`);
        return {cb: 'error'}
    }
}

function updateLatestBlockInfo(fork = "main", previousBlockInfo: any, latestBlockInfo: { [x: string]: { previousBlockInfo: any; latestBlockInfo: any; }; }) {
    const latestBlockInfoFilePath = getBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
    try {

        const latestBlockInfoFileData = getLatestBlockInfo().data;

        latestBlockInfo[fork] = {
            "previousBlockInfo": previousBlockInfo,
            "latestBlockInfo": previousBlockInfo
        };

        fs.writeFileSync(latestBlockInfoFilePath, latestBlockInfoFileData, {encoding:'utf8',flag:'w'});
        return {cb: 'success'};
    } catch (err: any) {
        utils.data_message.error(`Error writing latest block info: ${err.message}`);
        return {cb: 'error'};
    }
}

// Define the function to check if a block with a specific hash and index exists.
function existsBlock(blockHash: String, blockIndex: Number) {
    try {
        const latestBlockInfoFilePath = getBlockchainDataFilePath(`/indexes/blocks.json`);
        const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
        const blockArray = JSON.parse(data);
    
        // Check if an object with the specified index and hash exists in the array.
        const block: {index: Number, hash: String} = blockArray.find((block: { index: Number; hash: String; }) => block.index === blockIndex && block.hash === blockHash);

        if (block) {
            // The block with the specified index and hash exists in the main chain
            return { cb: 'success', exists: true};
        } else {
            // Check if there's a block with the specified index and a different hash in the provided JSON data
            const forkedBlock = blockArray.find((block: { index: Number; hash: String; }) => block.index === blockIndex && block.hash !== blockHash);
            if (forkedBlock) {
                // The block with the same index but a different hash exists in the provided data
                return { cb: 'success', exists: false, fork: true };
            }
            
            // The block with the specified index and hash does not exist
            return { cb: 'success', exists: false, fork: false };
        }
    } catch (err: any) {
        utils.data_message.error(`Error reading latest block info: ${err.message}`);
        return { cb: 'error' };
    }
}

function readBlockInForks(index: Number, hash: String) {

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
    } catch (err: any) {
        utils.data_message.error(`Error reading Block ${index} ${hash} in Forks: ${err.message}`);
        return {cb: "error"};
    }
}


export default {

    readBlockInForks,

    readTransaction,
    
    getLatestBlockInfo,
    updateLatestBlockInfo,

    existsBlock,

    ensureDirectoryExists,
    ensureFileExists,
    createStorageIfNotExists,

    addUTXOS,
    deleteUTXOS,
    readUTXOS,

    getBlockchainDataFilePath
}