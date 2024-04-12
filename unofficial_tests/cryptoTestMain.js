import { startTimer, endTimer } from './testUtils.js';
import elliptic from 'elliptic';
const { ec: EC } = elliptic;
import crypto from 'crypto';

const ec = new EC('secp256k1');

const privateKeyHex = "c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa";

const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
const publicKeyHex = keyPair.getPublic("hex");
const address = `lc0x${crypto.createHash("sha256").update(publicKeyHex).digest("hex").substring(0, 38)}`;

const message = "Hello, world!";
const messageHash = crypto.createHash("sha256").update(message).digest();

const raw_signature = keyPair.sign(messageHash);
const encodedSignature = encodeSignature(raw_signature);

function encodeSignature(signature) {
    return signature.r.toString("hex") + signature.s.toString("hex") + signature.recoveryParam.toString(16).padStart(2, "0");
}

function decodeSignature(signatureHex) {
    return { r: signatureHex.substring(0, 64), s: signatureHex.substring(64, 128), recoveryParam: parseInt(signatureHex.substring(128, 130), 16)};
}

async function getSenderAddress(data, signatureHex) {
    try {
        const signature = decodeSignature(signatureHex);
        const publicKey = ec.recoverPubKey(data, signature, signature.recoveryParam).encode('hex');
        return `lc0x${crypto.createHash("sha256").update(publicKey).digest("hex").substring(0, 38)}`;
    } catch (error) {
        return;
    }
}

async function gen() {
    await getSenderAddress(messageHash, encodedSignature);
}

async function asyncMain() {

    const promises = [];

    const startTime = startTimer();

    for (let i = 0; i < 1_000; i++) {
        promises.push(gen());
    }

    await Promise.all(promises);

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time 1:", elapsedTime / 1000, "seconds");

}

async function syncMain() {

    const startTime = startTimer();

    for (let i = 0; i < 1; i++) {
        await gen();
    }

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time 2:", elapsedTime / 1000, "seconds");

}


function main() {

    const startTime = startTimer();

    for (let i = 0; i < 1_000; i++) {
        gen();
    }

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time 3:", elapsedTime / 1000, "seconds");

}

//main();

(async function () {

    //await asyncMain();

    await syncMain();

    console.log(await getSenderAddress(messageHash, encodedSignature) === address);

})();
