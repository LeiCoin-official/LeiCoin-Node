var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import crypto from "crypto";
function sha256(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(data);
        // hash the message
        const hashBuffer = yield crypto.subtle.digest('SHA-256', msgBuffer);
        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // convert bytes to hex string
        const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
        return hashHex;
    });
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
function encodePublicKeyToEncodedPublicKey(public_key_pem) {
    //return base64EncodeToString(public_key_pem.replace('-----BEGIN PUBLIC KEY-----\n', '').replace('\n-----END PUBLIC KEY-----\n', ''));
    return base64EncodeToString(public_key_pem);
}
function decodeEncodedPublicKeyToPublicKey(encoded_public_key) {
    //return '-----BEGIN PUBLIC KEY-----\n' + base64DecodeToString(address) + '\n-----END PUBLIC KEY-----\n';
    return base64DecodeToString(encoded_public_key);
}
export { sha256, base64EncodeToString, base64DecodeToString, base64EncodeToBuffer, encodePublicKeyToEncodedPublicKey, decodeEncodedPublicKeyToPublicKey };
