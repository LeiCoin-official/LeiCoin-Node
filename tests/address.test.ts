import { describe, test, expect } from "bun:test";
import { PrivateKey } from "../src/crypto/cryptoKeys.js";
import { LCrypt } from "@leicoin/crypto";
import { Address32, AddressHex } from "@leicoin/common/models/address";
import { PX } from "@leicoin/common/types/prefix";

describe("address", () => {
    test("address32_enoding_and_decoding", () => {

        const privateKeyHex = PrivateKey.from("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa");
        const address = Address32.fromPrivateKey(PX.A_00, privateKeyHex);

        const hashData = LCrypt.sha256(Buffer.from("0123456789abcdef"));

        const signature = LCrypt.sign(hashData, PX.A_00, privateKeyHex);
        const recoveredAddress = Address32.fromSignature(hashData, signature);

        expect((address === recoveredAddress) ? address : null).toBe("lc0x91s7cb3gengt3fjud8f8zcev35f4jy23");
    });
    test("addresshex_enoding_and_decoding", () => {

        const privateKeyHex = PrivateKey.from("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa");
        const address = AddressHex.fromPrivateKey(PX.A_00, privateKeyHex);

        const hashData = LCrypt.sha256(Buffer.from("0123456789abcdef"));

        const signature = LCrypt.sign(hashData, PX.A_00, privateKeyHex);
        const recoveredAddress = AddressHex.fromSignature(hashData, signature);

        expect((address.toHex() === recoveredAddress.toHex()) ? address.toHex() : null).toBe("00403265a84f6d5fa13a3b61dc7fadbc111c38f822");
    });
    test("coinbase_address_gettting", () => {

        const privateKeyHex = PrivateKey.empty();
        const address = AddressHex.fromPrivateKey(PX.A_00, privateKeyHex);

        expect(address.toHex()).toBe("007f9c9e31ac8256ca2f258583df262dbc7d6f68f2");
    });
});