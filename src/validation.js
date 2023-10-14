const crypto = require('crypto');
const cryptoHandler = require('./handlers/cryptoHandlers');
const util = require('./utils.js');
const data = require('./handlers/dataHandler');

// Function to check if the transaction arguments are valid
function areTransactionArgsValid(transaction) {
    const { txid, senderAddress, recipientAddress, amount, signature } = transaction;
  
    // Ensure that all required fields are present
    if (!txid || !senderAddress || !recipientAddress || !amount || !signature) {
        return false;
    }
  
    return true;
}


function isTransactionSignatureValid(transaction) {
    const { signature, senderAddress } = transaction;
  
    // Prepare transaction data for verification (exclude the signature)
    const transactionData = { ...transaction };
    delete transactionData.signature;
    delete transactionData.txid;
  
    // decode the senderAddress
    const publicKeyPEM = cryptoHandler.base64DecodeToString(senderAddress);
  
    // Verify the signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(JSON.stringify(transactionData));
    const signatureBuffer = cryptoHandler.base64DecodeToBuffer(signature);
    const isVerified = verifier.verify(publicKeyPEM, signatureBuffer);
  
    return isVerified;
}

function isValidTransaction(transaction) {

	if (areTransactionArgsValid(transaction)) {

        if (isTransactionSignatureValid(transaction)) {
            return {cb: true, status: 200, message: "Transaction received and added to the mempool."};
        }

        return {cb: false, status: 400, message: "Bad Request. Invalid signature."};
    }
    
    return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};
}


function isValidBlock(block) {
    const { index, previousHash, transactions, timestamp, nonce, hash } = block;

    if (index == 0) {

        if (!data.isGenesisBlock()) return {cb: false, status: 400, message: 'Bad Request. Previous Block does not exists.'};

    } else {

        const previousBlock = data.readBlock(index - 1);

        if (previousBlock.cb !== "success") {
            if (previousBlock.cb === "none") {
                return {cb: false, status: 400, message: 'Bad Request. Previous Block does not exists.'};
            } else if (previousBlock.cb === "error") {
                return {cb: false, status: 500, message: 'Internal Server Error. Previous Block could not be readed.'};
            }
            return {cb: false, status: 500, message: 'Internal Server Error. Previous Block could not be readed.'};
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
    
    if (crypto.createHash('sha256').update( index + previousHash + JSON.stringify(transactions) + timestamp + nonce).digest('hex') !== hash) {
        return {cb: false, status: 400, message: 'Bad Request. Block hash does not correspond to its data.'};
    }

    if (data.existsBlock(hash, index)) {
        return {cb: false, status: 400, message: 'Bad Request. Block aleady exists.'};
    }

    // Verify that the hash of the block meets the mining difficulty criteria
    const hashPrefix = '0'.repeat(util.mining_difficulty);
    if (hash.substring(0, util.mining_difficulty) !== hashPrefix) {
        return {cb: false, status: 400, message: 'Bad Request. Block hash is invalid.'};
    }
  
    // Ensure that the block contains valid transactions (add your validation logic here)
    for (let transaction of transactions) {
        const transactionsValid = isValidTransaction(transaction);
        if (!transactionsValid) return {cb: false, status: 400, message: 'Bad Request. Block includes invalid transactions.'};
    }
    return {cb: true, status: 200, message: "Block received and added to the Blockchain."};
  }
  
module.exports = {
    isValidTransaction,
    isValidBlock
}