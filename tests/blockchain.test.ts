import { describe, test, expect } from "bun:test";
import { AddressHex } from "../src/objects/address.js";
import Block from "../src/objects/block.js";
import Signature from "../src/crypto/signature.js";
import { Blockchain } from "../src/storage/blockchain.js";
import { Uint256, Uint64 } from "../src/binary/uint.js";

describe("blockchain_testing", () => {
    /*test("is_valid_genesis_block", () => {
        const result = Blockchain.chainstate.isBlockChainStateMatching(new Block(
            Uint64.from(0),
            Uint64.from(0),
            Uint256.empty(),
            Uint256.empty(),
            Uint64.from(0),
            AddressHex.empty(),
            Signature.empty(),
            []
        ));
        expect(JSON.stringify(result)).toBe(JSON.stringify({ status: 12000, targetChain: "main", parentChain: "main" }));
    });*/
});