import elliptic from 'elliptic';
const { ec: EC } = elliptic;
import crypto from 'crypto';

// Create an ECDSA instance using the curve you're working with (e.g., secp256k1)
const ec = new EC('secp256k1');

function encodeSignature(signature) {
    return signature.r.toString("hex").padStart(64, "0") + signature.s.toString("hex").padStart(64, "0") + signature.recoveryParam.toString(16).padStart(2, "0");
}

function createHackSignature(signature) {
    return "0000000000000000000000000000000000000000000000000000000000000001" + "0000000000000000000000000000000000000000000000000000000000000001" + signature.recoveryParam.toString(16).padStart(2, "0");
}

function decodeSignature(hexData) {
    return { r: hexData.substring(0, 64), s: hexData.substring(64, 128), recoveryParam: parseInt(hexData.substring(128, 130), 16)};
}

const privateKeyHex = "c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa";
//const privateKeyHex = "0000000000000000000000000000000000000000000000000000000000000001";

const keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
const publicKeyHex = keyPair.getPublic("hex");

const address = "lc0x" + crypto.createHash("sha256").update(publicKeyHex).digest("hex").substring(0, 40);

// console.log("Public Key:", publicKeyHex, publicKeyHex.length);
// console.log("Private Key:", privateKeyHex, privateKeyHex.length);

// Sample signed message and its signature
//const message = crypto.randomBytes(32);
const message = "Hello, world!";
const messageHash = crypto.createHash("sha256").update(message).digest();
const signature = keyPair.sign(messageHash);


// console.log("Signature Original:", JSON.stringify(signature));

//const signatureDERHex = signature.toDER("hex");
//console.log("Signature DER Hex:", signatureDERHex, signatureDERHex.length);

const signatureHex = createHackSignature(signature);
//const signatureHex = encodeSignature(signature);
console.log("Signature Hex:", signatureHex, signatureHex.length);

const decoded_signature = decodeSignature(signatureHex);
console.log("Signature JSON:", decoded_signature);

// Recover the public key from the signature and message hash
const recoverPubKey = ec.recoverPubKey(messageHash, decoded_signature, decoded_signature.recoveryParam);

const recoverPubKeyHex = recoverPubKey.encode('hex');

const recoverAddress = "lc0x" + crypto.createHash("sha256").update(recoverPubKeyHex).digest("hex").substring(0, 40);

//const isSignatureValid = ec.verify(messageHash, decoded_signature, recoverPubKey, "hex");

console.log('Recovered Public Key:', recoverPubKeyHex, recoverPubKeyHex.length);
//console.log("Address:", address, address.length);
console.log('Recovered Address:', recoverAddress, recoverAddress.length);
//console.log("Recovered Public Key is equal to Original Public Key:", recoverPubKeyHex === publicKeyHex);
console.log("Recovered Address is equal to Original Address:", address === recoverAddress);
//console.log("Signature is Valid:", isSignatureValid);

