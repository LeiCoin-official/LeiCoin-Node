import Crypto from "../src/crypto/index.js"

describe('Address Testing', () => {
    test('Address Enoding And Decoding', async() => {

        const privateKeyHex = "c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa";
        const address = await Crypto.getAddressFromPrivateKey("00", privateKeyHex);

        const hashData = Crypto.sha256("0123456789abcdef", [], "buffer");

        const signature = await Crypto.sign(hashData, "00", privateKeyHex);
        const recoveredAddress = await Crypto.getAddressFromSignature(hashData, (signature as string));

        expect((address === recoveredAddress) ? address : null).toBe("lc0x1e4dd45874ec12bad77ac350369ca819e4f12f");
    });
});