const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');

app.use(bodyParser.json());

app.post('/verify-transaction', (req, res) => {
  (async function () {
    
    const signature = req.body.signature;
    const senderAddress = req.body.senderAddress;

    let transactionData = req.body;
    delete transactionData.signature;

    // Add the "-----BEGIN PUBLIC KEY-----" and "-----END PUBLIC KEY-----" markers
    publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${senderAddress}\n-----END PUBLIC KEY-----`;

    // Verify the signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(JSON.stringify(transactionData));
    const signatureBuffer = Buffer.from(signature, 'base64');
    const isVerified = verifier.verify(publicKeyPEM, signatureBuffer);

    if (isVerified) {
        res.send('Transaction verified');
    } else {
        res.send('Transaction verification failed');
    }
  })();
});

const port = 3000;
app.listen(port, () => {
    console.log(`Node.js server is running on port ${port}`);
});
