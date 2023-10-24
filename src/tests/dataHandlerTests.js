const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getTestBlockchainDataFilePath(subpath) {
    return path.join('./test_blockchain_data' + subpath);
}

// node -e "console.log(require('./dataHandlerTests.js').testGetLatestBlockInfo());"
function testGetLatestBlockInfo() {
    const latestBlockInfoFilePath = getTestBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
    try {
        const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
        return {cb: 'success', data: JSON.parse(data)}
    } catch (err) {
        console.error(`Error reading latest block info: ${err.message}`);
        return {cb: 'error'}
    }
}

// node -e "console.log(require('./dataHandlerTests.js').testUpdateLatestBlockInfo(1, '1'));"
function testUpdateLatestBlockInfo(index, hash) {
    const latestBlockInfoFilePath = getTestBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
    try {
        const data = {
            hash: hash,
            index: index,
        }
        fs.writeFileSync(latestBlockInfoFilePath, JSON.stringify(data), {encoding:'utf8',flag:'w'});
        return {cb: 'success'};
    } catch (err) {
        console.error(`Error writing latest block info: ${err.message}`);
        return {cb: 'error'};
    }
}


// Function to ensure the existence of a directory
function ensureDirectoryExists(directoryPath) {
    const fullDirectoryPath = getTestBlockchainDataFilePath(directoryPath);
    try {
        if (!fs.existsSync(fullDirectoryPath)) {
            fs.mkdirSync(fullDirectoryPath, { recursive: true });
            console.log(`Directory ${directoryPath} was created because it was missing.`);
        }
    } catch (err) {
        console.error(`Error ensuring the existence of a directory at ${directoryPath}: ${err.message}`);
    }
}

// Function to ensure the existence of a file
function ensureFileExists(filePath, content = '') {
    const fullFilePath = getTestBlockchainDataFilePath(filePath);
    try {
        const dir = path.dirname(fullFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Directory ${dir} was created because it was missing.`);
        }
        if (!fs.existsSync(fullFilePath)) {
            fs.writeFileSync(fullFilePath, content, 'utf8');
            console.log(`File ${filePath} was created because it was missing.`);
        }
    } catch (err) {
        console.error(`Error ensuring the existence of a file at ${filePath}: ${err.message}`);
    }
}

//node -e "console.log(require('./dataHandlerTests.js').testAddUTXOS({'txid': '46ef15db9ad8f97d506e4e9e459ef09b0694b2ca62d5e97407a03b44281f8979','senderAddress': 'TUZ3d0RRWUpLb1pJaHZjTkFRRUJCUUFEU3dBd1NBSkJBTXA0VDBJQXBZczVzZGJ0bkUyVG11NzNQR1U5a0JuVwp1Vyt3ODhpNWVSU2x2WWszSE1ubGZTVWpsWjZmT3g4NkZDejUvRVpTdXZDQzJ2TEp1d1ZhSHVNQ0F3RUFBUT09','input': [],'output': [{'recipientAddress': 'TUZ3d0RRWUpLb1pJaHZjTkFRRUJCUUFEU3dBd1NBSkJBTjRCajNlby96TUxEUWlESXdrU3p5QjNpTkl6cy83UQpPVDNiTkg3djFBUmNRZWRMNDBNRDFqTlBmVndETXFxVUNPbEFMS0czR2RwcjFIamIvcm9VT0NrQ0F3RUFBUT09','amount': '1','index': 0,'hash': 'c830f4fedc4b8fdc6d1cdc80619876333323b43ee5fadba5e0a19d19f89c5f58'},{'recipientAddress': 'TUZ3d0RRWUpLb1pJaHZjTkFRRUJCUUFEU3dBd1NBSkJBTXA0VDBJQXBZczVzZGJ0bkUyVG11NzNQR1U5a0JuVwp1Vyt3ODhpNWVSU2x2WWszSE1ubGZTVWpsWjZmT3g4NkZDejUvRVpTdXZDQzJ2TEp1d1ZhSHVNQ0F3RUFBUT09','amount': '1','index': 1,'hash': 'b7f6a5d2d27fe680b24a3bbbd82a6a7b9e6130cc0bb4aa1943c2f9e0b8806988'}],'signature': 'L7zhwFD3epFC4GwStNHLwZuJrVvaod0yKVGlxZYHWc+xjH3gY+pHVIUNyN2jSVwN4PRCkO/g2XvHXh1gwoyNWw=='}));"

function testAddUTXOS(transactionData) {
    //for (var i = 0; i < 10; i++) {

        // Iterate through the recipients in the output array
        for (let output of transactionData.output) {

            //output.recipientAddress = Buffer.from(crypto.randomBytes(2^64).toString("base64")).toString("base64");

            const recipientAddress = output.recipientAddress;

            if (recipientAddress.length < 54) {
                console.error(`Recipient address is not long enough for the specified format.`);
                return { cb: 'error' };
            }

            const directoryPath = `/utxos/${recipientAddress.slice(50, 52)}`;
            const filePath = `${recipientAddress.slice(52, 54)}.json`;

            // Ensure the existence of the directory and file for the recipient
            ensureFileExists(`${directoryPath}/${filePath}`, '{}');

            try {
                // Read existing UTXOs from the recipient's file
                const fullFilePath = getTestBlockchainDataFilePath(`${directoryPath}/${filePath}`);
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs = JSON.parse(existingData);

                if (!existingUTXOs[recipientAddress]) existingUTXOs[recipientAddress] = [];

                // Add UTXOs to the recipient's file
                existingUTXOs[recipientAddress].push({
                    txid: transactionData.txid,
                    index: output.index,
                    amount: output.amount
                });

                // Write the updated UTXOs back to the recipient's file
                fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2));
            } catch (err) {
                console.error(`Error writing UTXOs for recipient address ${recipientAddress}: ${err.message}`);
                return { cb: 'error' };
            }
        }

    //}

    return { cb: 'success' };
}

//node -e "console.log(require('./dataHandlerTests.js').testAddUTXOS({'txid': '46ef15db9ad8f97d506e4e9e459ef09b0694b2ca62d5e97407a03b44281f8979','senderAddress': 'TUZ3d0RRWUpLb1pJaHZjTkFRRUJCUUFEU3dBd1NBSkJBTXA0VDBJQXBZczVzZGJ0bkUyVG11NzNQR1U5a0JuVwp1Vyt3ODhpNWVSU2x2WWszSE1ubGZTVWpsWjZmT3g4NkZDejUvRVpTdXZDQzJ2TEp1d1ZhSHVNQ0F3RUFBUT09','input': [],'output': [{'recipientAddress': 'TUZ3d0RRWUpLb1pJaHZjTkFRRUJCUUFEU3dBd1NBSkJBTjRCajNlby96TUxEUWlESXdrU3p5QjNpTkl6cy83UQpPVDNiTkg3djFBUmNRZWRMNDBNRDFqTlBmVndETXFxVUNPbEFMS0czR2RwcjFIamIvcm9VT0NrQ0F3RUFBUT09','amount': '1','index': 0,'hash': 'c830f4fedc4b8fdc6d1cdc80619876333323b43ee5fadba5e0a19d19f89c5f58'},{'recipientAddress': 'TUZ3d0RRWUpLb1pJaHZjTkFRRUJCUUFEU3dBd1NBSkJBTXA0VDBJQXBZczVzZGJ0bkUyVG11NzNQR1U5a0JuVwp1Vyt3ODhpNWVSU2x2WWszSE1ubGZTVWpsWjZmT3g4NkZDejUvRVpTdXZDQzJ2TEp1d1ZhSHVNQ0F3RUFBUT09','amount': '1','index': 1,'hash': 'b7f6a5d2d27fe680b24a3bbbd82a6a7b9e6130cc0bb4aa1943c2f9e0b8806988'}],'signature': 'L7zhwFD3epFC4GwStNHLwZuJrVvaod0yKVGlxZYHWc+xjH3gY+pHVIUNyN2jSVwN4PRCkO/g2XvHXh1gwoyNWw=='}));"

function existsUTXO(transactionData) {
    const inputs = transactionData.input;

    for (const input of inputs) {
        const txid = input.txid;
        const index = input.index;

        for (const output of transactionData.output) {
            const address = transactionData.senderAdress;

            if (address.length < 54) {
                console.error(`Recipient address is not long enough for the specified format.`);
                return { cb: 'error' };
            }

            const directoryPath = `/utxos/${address.slice(50, 52)}`;
            const filePath = `${address.slice(52, 54)}.json`;

            try {
                // Check if the UTXO file for the address exists
                const fullFilePath = getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
                if (fs.existsSync(fullFilePath)) {
                    const existingData = fs.readFileSync(fullFilePath, 'utf8');
                    const existingUTXOs = JSON.parse(existingData);

                    // Check if the specified UTXO index exists for the given txid
                    const indexExists = existingUTXOs.some(utxo => utxo.txid === txid && utxo.index === index);

                    if (!indexExists) {
                        return { cb: 'success', exists: false };
                    }
                } else {
                    return { cb: 'success', exists: false };
                }
            } catch (err) {
                console.error(`Error checking UTXOs for recipient address ${address}: ${err.message}`);
                return { cb: 'error' };
            }
        }
    }

    return { cb: 'success', exists: true };
}


module.exports = {
    testGetLatestBlockInfo,
    testUpdateLatestBlockInfo,
    testAddUTXOS,
    existsUTXOS
}