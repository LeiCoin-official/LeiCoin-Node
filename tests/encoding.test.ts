import Transaction from "../src/objects/transaction.js";
import Wallet from "../src/objects/wallet.js";
import Block from "../src/objects/block.js";
import fs from "fs";
import Signature from "../src/objects/signature.js";
import { Uint256, Uint64 } from "../src/utils/binary.js";
import { AddressHex } from "../src/objects/address.js";
import { PrivateKey } from "../src/crypto/cryptoKeys.js";
import Minter, { MinterCredentials } from "../src/objects/minter.js";

describe('encoding_testing', () => {
    test('block_enoding_and_decoding', () => {

        const address = AddressHex.from("007f9c9e31ac8256ca2f258583df262dbc7d6f68f2");

        const block = new Block(
            Uint64.from(0),
            Uint64.from(0),
            Uint256.empty(),
            Uint256.empty(),
            Uint64.from(0),
            address,
            Signature.empty(),
            []
        )

        const decoded: any = Block.fromDecodedHex(block.encodeToHex());
        const decoded2 = Block.fromDecodedHex(decoded.encodeToHex());

        //fs.writeFileSync("./blockchain_data/test.bin", decoded2.encodeToHex(), {encoding: "hex", flag: "w"});
        //console.log(decoded2?.encodeToHex().length);

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(block));
    });
    /*test('block_enoding_and_decoding_with_file', () => {

        const block = Block.createNewBlock();

        const location = "./blockchain_data/tests/blocks/0.lcb";
        
        fs.writeFileSync(location, block.encodeToHex(), {encoding: "hex"});
        const decoded = Block.fromDecodedHex(fs.readFileSync(location, "hex"));

        fs.writeFileSync("./blockchain_data/tests/blocks/0.json", JSON.stringify(block));

        expect(JSON.stringify(decoded)).toBe(JSON.stringify(block));
    });*/
    test('transaction_enoding_and_decoding', () => {

        const address = AddressHex.from("007f9c9e31ac8256ca2f258583df262dbc7d6f68f2");
        const mc = new MinterCredentials(PrivateKey.empty(), address);

        const tx = Transaction.createCoinbaseTransaction(mc);

        const decoded: any = Transaction.fromDecodedHex(tx.encodeToHex());
        const decoded2 = Transaction.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(tx));
    });
    test('minter_enoding_and_decoding', () => {

        const address = AddressHex.from("0e7f9c9e31ac8256ca2f258583df262dbc7d6f68f2");

        const validator = new Minter(
            address,
            Uint64.from(32_0000_0000)
        );

        const decoded: any = Minter.fromDecodedHex(address, validator.encodeToHex());
        const decoded2 = Minter.fromDecodedHex(address, decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(validator));

    });
    test('wallet_enoding_and_decoding', () => {

        const address = AddressHex.from("007f9c9e31ac8256ca2f258583df262dbc7d6f68f2");
        
        const wallet = new Wallet(
            address,
            Uint64.from(10000000000000),
            Uint64.from(10000000)
        );

        const decoded: any = Wallet.fromDecodedHex(address, wallet.encodeToHex());
        const decoded2 = Wallet.fromDecodedHex(address, decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(wallet));
    });
});
