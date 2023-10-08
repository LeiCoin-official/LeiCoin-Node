const crypto = require('crypto');

// Function to generate a user's address (public key) and private key
function generateUserKeys() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Adjust the key size as needed
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { address: publicKey, privateKey };
}

// Generate a user's address (public key) and private key
const userKeys = generateUserKeys();

console.log('User Address (Public Key):\n', userKeys.address);
console.log('\nUser Private Key (Keep this secure):\n', userKeys.privateKey);

// Example transaction data (modify as needed)
const transactionData = `Sender: ${userKeys.address}, Recipient: Bob, Amount: 10`;

// Sign the transaction data with the private key
const signer = crypto.createSign('SHA256');
signer.update(transactionData);
const signature = signer.sign(userKeys.privateKey, 'base64');

console.log('Transaction Data:\n', transactionData);
console.log('\nSignature:\n', signature);
