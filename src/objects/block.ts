import { Transaction } from "./transaction.js";
import mempool from "../storage/mempool.js";
import blockchain from "../storage/blockchain.js";
import EncodingUtils from "../handlers/encodingUtils.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";
import Attestation from "./attestation.js";
import config from "../handlers/configHandler.js";
import DataUtils from "../utils/dataUtils.js";
import { Uint256, Uint64, Uint8 } from "../utils/binary.js";
import { AddressHex } from "./address.js";

export class Block {

    public index: Uint64;
    public hash: Uint256;
    public previousHash: Uint256;
    public timestamp: Uint64;
    public proposer: AddressHex;
    public attestations: Attestation[];
    public transactions: Transaction[];
    public version: Uint8;

    constructor(
        index: Uint64,
        hash: Uint256,
        previousHash: Uint256,
        timestamp: Uint64,
        proposer: AddressHex,
        attestations: Attestation[],
        transactions: Transaction[],
        version = Uint8.alloc()
    ) {

        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.proposer = proposer;
        this.attestations = attestations;
        this.transactions = transactions;
        this.version = version;

    }

    public static createNewBlock() {
        
        const previousBlock = blockchain.chainstate.getLatestBlockInfo();
    
        let newIndex;
        let previousHash: Uint256;
    
        if (!previousBlock || (typeof(previousBlock.index) !== 'number')) newIndex = Uint64.alloc();
        else newIndex = previousBlock.index, "1";
    
        if (!previousBlock || (typeof(previousBlock.hash) !== 'string')) previousHash = Uint256.alloc();
        else previousHash = previousBlock.hash;

        const coinbase = Transaction.createCoinbaseTransaction();

        const transactions = Object.values(mempool.transactions);
        transactions.unshift(coinbase);
    
        const newBlock = new Block(
            newIndex,
            Uint256.alloc(),
            previousHash,
            Uint64.from(new Date().getTime()),
            AddressHex.from(config.staker.address),
            [],
            transactions
        );
        
        newBlock.hash.set(newBlock.calculateHash());

        return newBlock;
    }

    public encodeToHex(add_empty_bytes = true, forHash = false) {

        const returnData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "index"},
            (forHash ? null : {key: "hash"}),
            {key: "previousHash", type: "hash"},
            {key: "timestamp"},
            {key: "proposer", type: "address"},
            {key: "attestations", type: "array", encodeFunc: Attestation.prototype.encodeToHex},
            {key: "transactions", type: "array", encodeFunc: Transaction.prototype.encodeToHex}
        ], add_empty_bytes);

        return returnData.data;

    }

    public static fromDecodedHex(hexData: string, returnLength = false) {

        try {
            const returnData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "index"},
                {key: "hash"},
                {key: "previousHash", type: "hash"},
                {key: "timestamp"},
                {key: "proposer", type: "address"},
                {key: "attestations", length: 2, type: "array", decodeFunc: Attestation.fromDecodedHex},
                {key: "transactions", length: 2, type: "array", decodeFunc: Transaction.fromDecodedHex}
            ], returnLength);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                const block = DataUtils.createInstanceFromJSON(Block, data);

                if (returnLength) {
                    return {data: block, length: returnData.length};
                }
                return block;
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Block from Decoded Hex: ${err.message}`);
        }

        return null;
    }

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(false, true));
    }

    public addAttestation(attestation: Attestation) {
        this.attestations.push(attestation);
    }

}

export default Block;