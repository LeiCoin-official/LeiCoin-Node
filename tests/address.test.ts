import Crypto from "../src/crypto/index.js"
import { Address32, AddressHex } from "../src/objects/address.js";

describe('address_testing', () => {
    test('address_enoding_and_decoding', () => {

        const privateKeyHex = "c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa";
        const address = Address32.fromPrivateKey("00", privateKeyHex);

        const hashData = Crypto.sha256("0123456789abcdef", "buffer");

        const signature = Crypto.sign(hashData, "00", privateKeyHex);
        const recoveredAddress = Address32.fromSignature(hashData, (signature as string));

        expect((address === recoveredAddress) ? address : null).toBe("lc0xtul58zuvq45away823ypr4qr4bafbpz6");
    });
    test('coinbase_address_gettting', () => {

        const privateKeyHex = new Array<string>(32).fill("00").join("");
        const address = AddressHex.fromPrivateKey("00", privateKeyHex);

        expect(address).toBe("00e3b0c44298fc1c149afbf4c8996fb92427ae41e4");
    });
});