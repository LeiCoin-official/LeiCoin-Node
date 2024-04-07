import pkg from 'elliptic';
const { ec: EC } = pkg;
import crypto from 'crypto';

// Create an ECDSA instance using the curve you're working with (e.g., secp256k1)
const curve = new EC('secp256k1');

const privateKeyHex = "c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa";

const keyPair = curve.keyFromPrivate(privateKeyHex, 'hex');
const publicKeyHex = keyPair.getPublic("hex");

console.log("Public Key:", publicKeyHex, publicKeyHex.length);
console.log("Private Key:", privateKeyHex, privateKeyHex.length);

// Sample signed message and its signature
const message = 'Hello, world!';
const messageHash = crypto.createHash("sha256").update(message).digest();
const signature = keyPair.sign(messageHash);

const signatureHex = signature.toDER("hex");
console.log("Signature Hex:", signatureHex, signatureHex.length);

// Recover the public key from the signature and message hash
const recoverPubKey = curve.recoverPubKey(messageHash, signature, signature.recoveryParam);

const recoverPubKeyHex = recoverPubKey.encode('hex')

console.log('Recovered Public Key:', recoverPubKeyHex);

console.log("Recovered Public Key is equal to Original Public Key:", recoverPubKeyHex === publicKeyHex)
