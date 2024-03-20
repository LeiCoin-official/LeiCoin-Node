import * as ed from '@noble/ed25519';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
import { startTimer, endTimer } from './randtest.js';

//const privKey = ed.utils.randomPrivateKey();
//const pubKey = await ed.getPublicKeyAsync(privKey);

const publicKeyHexInput = "9d022ec2c6d15455e38a035a17f096d2be5da2d8f4bd65a10a811ea2230a64a7";
const privateKeyHexInput = "9052be2967b34dab33df7fa168401c187b052c30672e62469383384969dd3527";

const privKey = Uint8Array.from(Buffer.from(privateKeyHexInput.slice(0, 64), "hex"));

const pubKey = await ed.getPublicKeyAsync(privKey);
const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
const signature = await ed.signAsync(message, privKey);

const publicKeyHex = Buffer.from(pubKey).toString('hex');
const privateKeyHex = Buffer.from(privKey).toString("hex");
const signatureHex = Buffer.from(signature).toString('hex');

console.log("Public Key", publicKeyHex, publicKeyHex.length);
console.log("Private Key", privateKeyHex, privateKeyHex.length);
console.log("Signature", signatureHex, signatureHex.length);

async function gen() {
    const isValid = await ed.verifyAsync(signature, message, pubKey);
}

async function asyncMain() {

    const startTime = startTimer();

    const promises = [];

    for (let i = 0; i < 10; i++) {
        promises.push(gen());
    }

    await Promise.all(promises);

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

async function main() {

    const startTime = startTimer();

    for (let i = 0; i < 10; i++) {
        await gen();
    }

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

(async function () {

    await asyncMain();
    await main();

})();

