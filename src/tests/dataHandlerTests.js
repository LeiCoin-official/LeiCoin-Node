const fs = require('fs');
const path = require('path');

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

// node -e "console.log(require('./dataHandlerTests.js').testAddUTXO());"
{
    ""
}
function testAddUTXO(transactionData) {
    const senderAddress = transactionData.senderAddress;
    if (senderAddress.length < 54) {
        util.data_message.error(`Sender address is not long enough for the specified format.`);
        return { cb: 'error' };
    }
    
    const directoryPath = `/utxos/${senderAddress.slice(50, 52)}`;
    const filePath = `${senderAddress.slice(52, 54)}.json`;

    // Ensure the existence of the directory and file
    ensureDirectoryExists(directoryPath);
    ensureFileExists(`${directoryPath}/${filePath}`, '[]');

    try {
        // Read existing UTXOs from the file
        const fullFilePath = getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
        const existingData = fs.readFileSync(fullFilePath, 'utf8');
        const existingUTXOs = JSON.parse(existingData);

        // Extract output information from the transaction data and add it to the existing UTXOs
        for (const output of transactionData.output) {
            existingUTXOs.push({
                txid: transactionData.txid,
                index: output.index,
                senderAddress: senderAddress,
                amount: output.amount
            });
        }

        // Write the updated UTXOs back to the file
        fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2));

        return { cb: 'success' };
    } catch (err) {
        util.data_message.error(`Error writing UTXOs for sender address ${senderAddress}: ${err.message}`);
        return { cb: 'error' };
    }
}

module.exports = {
    testGetLatestBlockInfo,
    testUpdateLatestBlockInfo,
    testAddUTXOs
}