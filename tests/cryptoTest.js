import * as ed from '@noble/ed25519';

import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;


async function gen() {
  // keys, messages & other inputs can be Uint8Arrays or hex strings
  // Uint8Array.from([0xde, 0xad, 0xbe, 0xef]) === 'deadbeef'
  const privKey = ed.utils.randomPrivateKey(); // Secure random private key
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey);
  const signature = await ed.signAsync(message, privKey);
  const isValid = await ed.verifyAsync(signature, message, pubKey);
  console.log(isValid);
}

async function main () {

    const promises = [];

    for (let i = 0; i < 128; i++) {

        promises.push(gen());

    }

    await Promise.all(promises);

}

main();