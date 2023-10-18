
async function sha256(data) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(data);
  
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
  
    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

function base64EncodeToString(data) {
    return Buffer.from(data).toString('base64');
}

function base64EncodeToBuffer(data) {
    return Buffer.from(data, 'base64');
}

function base64DecodeToString(data) {
    return Buffer.from(data, 'base64').toString();
}

function encodePublicKeyToAddress(public_key_pem) {
    return base64EncodeToString(public_key_pem.replace('-----BEGIN PUBLIC KEY-----\n', '').replace('\n-----END PUBLIC KEY-----\n', ''));
}

function decodeAddressToPublicKey(address) {
    return '-----BEGIN PUBLIC KEY-----\n' + base64DecodeToString(address) + '\n-----END PUBLIC KEY-----\n';
}

module.exports = {
    sha256,
    base64EncodeToString,
    base64DecodeToString,
    base64EncodeToBuffer,
    encodePublicKeyToAddress,
    decodeAddressToPublicKey
}

