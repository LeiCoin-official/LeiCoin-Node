import blockchain from "../src/storage/blockchain.js";

describe('Blockchain Testing', () => {
    test('Test isValidGenesisBlock', () => {
        const result = blockchain.chainstate.isValidGenesisBlock("0000006f289771aba5d293c448ed782f59a33bd293d96e41c535f0155f5c22d4");
        expect(JSON.stringify(result)).toBe(JSON.stringify({ isGenesisBlock: true, isForkOFGenesisBlock: false }));
    });
});