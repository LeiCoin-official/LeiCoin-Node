const crypto = require('crypto');
const cryptoHandler = require('./handlers/cryptoHandlers.js');

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
    
    return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};;
}

  
module.exports = {
    isValidTransaction
}