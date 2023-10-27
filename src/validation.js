const crypto = require('crypto');
const cryptoHandler = require('./handlers/cryptoHandlers');
const util = require('./utils.js');
const { readUTXOS, isGenesisBlock, readBlock, readBlockInForks, existsBlock, getLatestBlockInfo, mempool } = require('./handlers/dataHandler');


function isValidTransaction(transaction) {

    function isTransactionSignatureValid(transaction) {
        const { signature, publicKey } = transaction;
    
        // Prepare transaction data for verification (exclude the signature)
        const transactionData = { ...transaction };
        delete transactionData.signature;
        delete transactionData.txid;
    
        // decode the senderAddress
        const publicKeyPEM = cryptoHandler.decodeAddressToPublicKey(publicKey);

        // Verify the signature
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(JSON.stringify(transactionData));
        const signatureBuffer = cryptoHandler.base64EncodeToBuffer(signature);
        const isVerified = verifier.verify(publicKeyPEM, signatureBuffer);
    
        return isVerified;
    }


    const { txid, senderAddress, publicKey, output, input, signature } = transaction;
    
    // Ensure that all required fields are present
    if (!txid || !senderAddress || !publicKey || !output || !signature || !input) {
        return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};;
    }

    if (!isTransactionSignatureValid(transaction)) {
        return {cb: false, status: 400, message: "Bad Request. Invalid signature."};
    }

    const publicKeyPEM = cryptoHandler.decodeAddressToPublicKey(publicKey);
    if (crypto.createHash('sha256').update(publicKeyPEM).digest('hex') !== senderAddress) {
        return {cb: false, status: 400, message: "Bad Request. Invalid signature."};
    }

    let utxo_input_amount = 0;
    let utxo_output_amount = 0;

    let added_input_utxos = [];

    for (let input_utxo of input) {
        if (added_input_utxos.includes(`${input_utxo.txid}_${input_utxo.index}`)) {
            return {cb: false, status: 400, message: 'Bad Request. Transaction includes double spending UTXO inputs.'};
        }
        let utxoData = readUTXOS(senderAddress, input_utxo.txid, input_utxo.index);
        if (utxoData.cb !== "success") {
            if (utxoData.cb === "none") {
                return {cb: false, status: 400, message: 'Bad Request. Transaction includes input UTXO that does not exists.'};
            }
            return {cb: false, status: 500, message: 'Internal Server Error. Transaction includes input UTXO that could not be readed.'};
        }
        added_input_utxos.push(`${input_utxo.txid}_${input_utxo.index}`);
        utxo_input_amount += utxoData.amount;
    }

    for (let output_utxo of output) {
        utxo_output_amount += output_utxo.amount;
    }

    if (utxo_input_amount < utxo_output_amount) {
        return {cb: false, status: 400, message: 'Bad Request. Transaction output amount is higher than the input amount.'};
    }

    if (utxo_output_amount <= 0) {
        return {cb: false, status: 400, message: 'Bad Request. Transaction output amount must be greater than zero.'};
    }
    
    return {cb: true, status: 200, message: "Transaction received and added to the mempool."};
}

function isNewForkBlock() {
    
}

function isValidBlock(block) {
    const { index, previousHash, transactions, timestamp, nonce, coinbase, hash } = block;

    if ((!index && index !== 0) || (!previousHash && index !== 0) || !transactions || !timestamp || !nonce || !coinbase || !hash) {
        return false;
    }

    let forktype = "none";

    if (index == 0) {

        if (!isGenesisBlock()) return {cb: false, status: 400, message: 'Bad Request. Previous Block does not exists.'};

    } else {

        let previousBlock = readBlock(index - 1);

        if (previousBlock.cb !== "success") {

            previousBlock = readBlockInForks(index - 1, previousHash);

            forktype = "forkchild";

            if (previousBlock.cb !== "success") {
                if (previousBlock.cb === "none") {
                    return {cb: false, status: 400, message: 'Bad Request. Previous Block does not exists.'};
                }
                return {cb: false, status: 500, message: 'Internal Server Error. Previous Block could not be readed.'};
            }
        }

        // Confirm that the block's index is greater than the previous block's index by one
        if (index !== previousBlock.data.index + 1) {
            return {cb: false, status: 400, message: 'Bad Request. Block index does not correspond to the previous blocks minus one.'};
        }
    
        // Validate that the previous hash in the new block matches the hash of the previous block
        if (previousHash !== previousBlock.data.hash) {
            return {cb: false, status: 400, message: 'Bad Request. Previous Block hash is not the same as the previous block hash'};
        }
    }
    
    if (crypto.createHash('sha256').update( index + previousHash + JSON.stringify(transactions) + timestamp + nonce + JSON.stringify(coinbase)).digest('hex') !== hash) {
        return {cb: false, status: 400, message: 'Bad Request. Block hash does not correspond to its data.'};
    }

    //we have to make that better
    const blocksExist = existsBlock(hash, index);
    if (blocksExist.cb === "success" && !blocksExist.exists) {
        if (blocksExist.fork) {
            const latestblockinfo = getLatestBlockInfo();
            if (latestblockinfo.cb === "success" && latestblockinfo.data.index === index) {
                forktype = "newfork";
            } else {
                return {cb: false, status: 400, message: 'Bad Request. Forks for older Blocks are not allowed.'};
            }
        }
    } else {
        return {cb: false, status: 400, message: 'Bad Request. Block aleady exists.'};
    }

    // Verify that the hash of the block meets the mining difficulty criteria
    const hashPrefix = '0'.repeat(util.mining_difficulty);
    if (hash.substring(0, util.mining_difficulty) !== hashPrefix) {
        return {cb: false, status: 400, message: 'Bad Request. Block hash is invalid.'};
    }

    if (coinbase.amount !== util.mining_pow) {
        return {cb: false, status: 400, message: 'Bad Request. Coinbase amount is invalid.'};
    }
  
    // Ensure that the block contains valid transactions (add your validation logic here)
    for (let [, transactionData] of Object.entries(transactions)) {
        const transactionsValid = isValidTransaction(transactionData);
        if (!transactionsValid.cb) return {cb: false, status: 400, message: 'Bad Request. Block includes invalid transactions.'};
    }
    return {cb: true, status: 200, message: "Block received and added to the Blockchain.", forktype: forktype};
}
  
module.exports = {
    isValidTransaction,
    isValidBlock
}