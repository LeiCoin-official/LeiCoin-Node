import Transaction from "../src/objects/transaction.js";
import Wallet from "../src/objects/wallet.js";
import Block from "../src/objects/block.js";
import Attestation from "../src/objects/attestation.js";
import Proposition from "../src/objects/proposition.js";
import Validator from "../src/objects/validator.js";

describe('Encoding Testing', () => {
    test('Block Enoding And Decoding', () => {

        const block = Block.createNewBlock();

        const decoded: any = Block.fromDecodedHex(block.encodeToHex());
        const decoded2 = Block.fromDecodedHex(decoded.encodeToHex());

        //fs.writeFileSync("./blockchain_data/test.bin", decoded2.encodeToHex(), {encoding: "hex", flag: "w"});
        //console.log(decoded2?.encodeToHex().length);

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(block));
    });
    test('Attestation Enoding And Decoding', () => {

        const attestation = new Attestation(
            "lc0e00000000000000000000000000000000000000",
            "0000000000000000000000000000000000000000000000000000000000000000",
            true,
            "1",
            "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        );

        const decoded: any = Attestation.fromDecodedHex(attestation.encodeToHex());
        const decoded2 = Attestation.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(attestation));
    });
    test('Proposition Enoding And Decoding', () => {

        const proposition = new Proposition(
            "lc0e00000000000000000000000000000000000000",
            "1",
            "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            Block.createNewBlock()
        );

        const decoded: any = Proposition.fromDecodedHex(proposition.encodeToHex());
        const decoded2 = Proposition.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(proposition));
    });
    test('Transaction Enoding And Decoding', () => {

        const tx = Transaction.createCoinbaseTransaction();

        const decoded: any = Transaction.fromDecodedHex(tx.encodeToHex());
        const decoded2 = Transaction.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(tx));
    });
    test('Validator Enoding And Decoding', () => {

        const publicKey = "0000000000000000000000000000000000000000000000000000000000000000";

        const validator = new Validator(
            publicKey,
            "32" +"0000" + "0000"
        );

        const decoded: any = Validator.fromDecodedHex(publicKey, validator.encodeToHex());
        const decoded2 = Validator.fromDecodedHex(publicKey, decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(validator));

    });
    test('Test Wallet Enoding And Decoding', () => {

        const address = "lc0x6c6569636f696e6e65745f636f696e62617365";
        
        const wallet = new Wallet(
            address,
            "10000000000000",
            "10000000"
        );

        const decoded: any = Wallet.fromDecodedHex(address, wallet.encodeToHex());
        const decoded2 = Wallet.fromDecodedHex(address, decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(wallet));
    });
});
