import blockchain from "../build/src/handlers/storage/blockchain.js";

describe('testing index file', () => {
  test('empty string should result in zero', () => {
    const result = blockchain.isValidGenesisBlock("");
    expect(result).toBe({ isGenesisBlock: true, isForkOFGenesisBlock: false });
  });
});