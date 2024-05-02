import { PrivateKey } from "../src/crypto/cryptoKeys.js";
import Crypto from "../src/crypto/index.js"
import { Address32, AddressHex } from "../src/objects/address.js";
import { PX } from "../src/objects/prefix.js";

describe('address_testing', () => {
    test('address_enoding_and_decoding', () => {

        const privateKeyHex = PrivateKey.from("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa");
        const address = Address32.fromPrivateKey(PX.A_00, privateKeyHex);

        const hashData = Crypto.sha256("0123456789abcdef");

        const signature = Crypto.sign(hashData, PX.A_00, privateKeyHex);
        const recoveredAddress = Address32.fromSignature(hashData, signature);

        expect((address === recoveredAddress) ? address : null).toBe("lc0xtul58zuvq45away823ypr4qr4bafbpz6");
    });
    test('coinbase_address_gettting', () => {

        const privateKeyHex = PrivateKey.empty();
        const address = AddressHex.fromPrivateKey(PX.A_00, privateKeyHex);

        expect(address.toHex()).toBe("00e3b0c44298fc1c149afbf4c8996fb92427ae41e4");
    });
});