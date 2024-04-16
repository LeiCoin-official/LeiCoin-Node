import Transaction from "../src/objects/transaction.js";
import Wallet from "../src/objects/wallet.js";
import Block from "../src/objects/block.js";
import Attestation from "../src/objects/attestation.js";
import Proposition from "../src/objects/proposition.js";
import Validator from "../src/objects/validator.js";
import utils from "../src/utils/index.js";

describe('encoding_testing', () => {
    test('block_enoding_and_decoding', () => {

        //const block = Block.createNewBlock();

        const block = utils.createInstanceFromJSON(Block, JSON.parse("{\"index\":\"0\",\"hash\":\"297040b8eecf1c48fdf7a58ce0df4a585e95c6b7418890051924ecc3328ff799\",\"previousHash\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"timestamp\":\"1713299151676\",\"proposer\":\"lc0x1e4dd45874ec12bad77ac350369ca819e4f12f\",\"attestations\":[],\"transactions\":[{\"txid\":\"ee82f9c49cd73edf22fe17c6baf7b0b1f24c398ae4a5a7a577cec5e493f62f87\",\"senderAddress\":\"lc0xe3b0c44298fc1c149afbf4c8996fb92427ae41\",\"recipientAddress\":\"lc0x1e4dd45874ec12bad77ac350369ca819e4f12f\",\"amount\":\"10\",\"nonce\":\"0\",\"timestamp\":\"1713299151600\",\"input\":\"\",\"signature\":\"00c8dd9ccc8d0e385f93a87118b4269d1d08bd45dcd031462dbce8b49b85780afb35751fd378193834a49027e549b77da668e0efa2cc2fefa8a75735cd572769e01\",\"version\":\"00\"}],\"version\":\"00\"}"));

        const decoded: any = Block.fromDecodedHex(block.encodeToHex());
        const decoded2 = Block.fromDecodedHex(decoded.encodeToHex());

        //fs.writeFileSync("./blockchain_data/test.bin", decoded2.encodeToHex(), {encoding: "hex", flag: "w"});
        //console.log(decoded2?.encodeToHex().length);

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(block));
    });
    test('attestation_enoding_and_decoding', () => {

        const attestation = new Attestation(
            "lc0xe3b0c44298fc1c149afbf4c8996fb92427ae41",
            "0000000000000000000000000000000000000000000000000000000000000000",
            true,
            "1",
            "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        );

        const decoded: any = Attestation.fromDecodedHex(attestation.encodeToHex());
        const decoded2 = Attestation.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(attestation));
    });
    test('proposition_enoding_and_decoding', () => {

        const proposition = new Proposition(
            "lc0xe3b0c44298fc1c149afbf4c8996fb92427ae41",
            "1",
            "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            Block.createNewBlock()
        );

        const decoded: any = Proposition.fromDecodedHex(proposition.encodeToHex());
        const decoded2 = Proposition.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(proposition));
    });
    test('transaction_enoding_and_decoding', () => {

        const tx = Transaction.createCoinbaseTransaction();

        //const tx = utils.createInstanceFromJSON(Transaction, JSON.parse("{\"txid\":\"ee82f9c49cd73edf22fe17c6baf7b0b1f24c398ae4a5a7a577cec5e493f62f87\",\"senderAddress\":\"lc0xe3b0c44298fc1c149afbf4c8996fb92427ae41\",\"recipientAddress\":\"lc0x1e4dd45874ec12bad77ac350369ca819e4f12f\",\"amount\":\"10\",\"nonce\":\"0\",\"timestamp\":\"1713299151600\",\"input\":\"\",\"signature\":\"00c8dd9ccc8d0e385f93a87118b4269d1d08bd45dcd031462dbce8b49b85780afb35751fd378193834a49027e549b77da668e0efa2cc2fefa8a75735cd572769e01\",\"version\":\"00\"}"));

        const decoded: any = Transaction.fromDecodedHex(tx.encodeToHex());
        const decoded2 = Transaction.fromDecodedHex(decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(tx));
    });
    test('validator_enoding_and_decoding', () => {

        const address = "lc0xe3b0c44298fc1c149afbf4c8996fb92427ae41";

        const validator = new Validator(
            address,
            "32" +"0000" + "0000"
        );

        const decoded: any = Validator.fromDecodedHex(address, validator.encodeToHex());
        const decoded2 = Validator.fromDecodedHex(address, decoded.encodeToHex());

        expect(JSON.stringify(decoded2)).toBe(JSON.stringify(validator));

    });
    test('wallet_enoding_and_decoding', () => {

        const address = "lc0xe3b0c44298fc1c149afbf4c8996fb92427ae41";
        
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
