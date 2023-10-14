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

module.exports = {
    testGetLatestBlockInfo,
    testUpdateLatestBlockInfo
}