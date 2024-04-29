import blockchain from "../src/storage/blockchain.js";
import { Uint256 } from "../src/utils/binary.js";

describe('blockchain_testing', () => {
    test('is_valid_genesis_block', () => {
        const result = blockchain.chainstate.isValidGenesisBlock(Uint256.from("0000006f289771aba5d293c448ed782f59a33bd293d96e41c535f0155f5c22d4"));
        expect(JSON.stringify(result)).toBe(JSON.stringify({ isGenesisBlock: true, isForkOFGenesisBlock: false }));
    });
});