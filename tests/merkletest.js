import crypto from 'crypto';

// Generate key pairs for validators using crypto module
function generateKeyPairs(numPairs) {
    const keyPairs = [];
    for (let i = 0; i < numPairs; i++) {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048, // Adjust the modulus length as needed
        });
        keyPairs.push({ privateKey, publicKey });
    }
    return keyPairs;
}

// Sign data with private key using crypto module
function signData(data, privateKey) {
    return crypto.sign(null, Buffer.from(data), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    }).toString('hex');
}

// Function to hash data using SHA-256
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Function to build Merkle tree from signatures
function buildMerkleTree(signatures) {
    const tree = signatures.map(signature => sha256(signature));
    let level = tree.length;
    while (level > 1) {
        const levelNodes = [];
        for (let i = 0; i < tree.length; i += 2) {
            const left = tree[i];
            const right = i + 1 < tree.length ? tree[i + 1] : '';
            levelNodes.push(sha256(left + right));
        }
        tree.splice(0, tree.length, ...levelNodes);
        level = Math.ceil(level / 2);
    }
    return tree;
}

// Function to verify signature against Merkle root
function verifySignature(signature, publicKey, merkleRoot) {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(merkleRoot);
    return verifier.verify(publicKey, Buffer.from(signature, 'hex'), 'hex');
}

// Generate key pairs for validators
const numValidators = 16;
const validators = generateKeyPairs(numValidators);

// Sign data with each validator's private key
const dataToSign = 'Some data to sign';
const signatures = validators.map(validator => signData(dataToSign, validator.privateKey.export({ format: 'pem', type: 'pkcs1' })));


// Build Merkle tree from signatures
const merkleTree = buildMerkleTree(signatures);
const merkleRoot = merkleTree[0]; // Root hash

// Choose a random validator to verify its signature
const randomValidatorIndex = Math.floor(Math.random() * numValidators);
const randomValidator = validators[randomValidatorIndex];
const randomValidatorPublicKey = randomValidator.publicKey.export({ format: 'pem', type: 'pkcs1' });
const randomValidatorSignature = signatures[randomValidatorIndex];

// Verify the random validator's signature against the Merkle root
const isValid = verifySignature(randomValidatorSignature, randomValidatorPublicKey, merkleRoot);

console.log('Merkle root:', merkleRoot);
console.log('Random validator\'s public key:', randomValidatorPublicKey);
console.log('Random validator\'s signature:', randomValidatorSignature);
console.log('Is signature valid?', isValid);
