const crypto = require('crypto');

// Function to check if the transaction arguments are valid
function areTransactionArgsValid(transaction) {
    const { signature, senderAddress, recipientAddress } = transaction;
  
    // Ensure that all required fields are present
    if (!signature || !senderAddress || !recipientAddress) {
        return false;
    }
  
    return true;
}
  

function isSignatureValid(transaction) {
    const { signature, senderAddress } = transaction;
  
    // Prepare transaction data for verification (exclude the signature)
    const transactionData = { ...transaction };
    delete transactionData.signature;
  
    // Add the "-----BEGIN PUBLIC KEY-----" and "-----END PUBLIC KEY-----" markers
    const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${senderAddress}\n-----END PUBLIC KEY-----`;
  
    // Verify the signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(JSON.stringify(transactionData));
    const signatureBuffer = Buffer.from(signature, 'base64');
    const isVerified = verifier.verify(publicKeyPEM, signatureBuffer);
  
    return isVerified;
}

function isValidTransaction(transaction) {

	if (areTransactionArgsValid(transaction)) {

        if (isSignatureValid(transaction)) {
            return true;
        }

        return {cb: false, errormessage: "Bad Request. Invalid signature."};
    }
    
    return {cb: false, errormessage: "Bad Request. Invalid arguments."};;
}

  
module.exports = {
    isValidTransaction
}