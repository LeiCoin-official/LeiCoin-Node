import * as ed from '@noble/ed25519'; // ESM-only. Use bundler for common.js
// import * as ed from "https://deno.land/x/ed25519/mod.ts"; // Deno
// import * as ed from "https://unpkg.com/@noble/ed25519"; // Unpkg
(async () => {
  // keys, messages & other inputs can be Uint8Arrays or hex strings
  // Uint8Array.from([0xde, 0xad, 0xbe, 0xef]) === 'deadbeef'
  const privKey = ed.utils.randomPrivateKey(); // Secure random private key
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey);
  const signature = await ed.signAsync(message, privKey);
  const isValid = await ed.verifyAsync(signature, message, pubKey);
})();