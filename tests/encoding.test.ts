import Transaction from "../src/objects/transaction.js";
import Wallet from "../src/objects/wallet.js";
import Block from "../src/objects/block.js";

describe('Encoding Testing', () => {
    test('Test Transaction Enoding And Decoding', () => {

        const tx = Transaction.createCoinbaseTransaction();

        const decoded: any = Transaction.fromDecodedHex(tx.encodeToHex());
        const decoded2 = Transaction.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(tx));
    });
    test('Test Wallet Enoding And Decoding', () => {

        const address = "lc0x6c6569636f696e6e65745f636f696e62617365";
        const wallet = new Wallet(address, "10000000000000", "10000000");

        const decoded: any = Wallet.fromDecodedHex(address, wallet.encodeToHex());
        const decoded2 = Wallet.fromDecodedHex(address, decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(wallet));
    });
    test('Block Enoding And Decoding', () => {

        const block = Block.createNewBlock();

        const decoded: any = Block.fromDecodedHex(block.encodeToHex());
        const decoded2 = Block.fromDecodedHex(decoded.encodeToHex());

        //fs.writeFileSync("./blockchain_data/test.bin", decoded2.encodeToHex(), {encoding: "hex", flag: "w"});
        //console.log(decoded2?.encodeToHex().length);

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(block));
    });
});
