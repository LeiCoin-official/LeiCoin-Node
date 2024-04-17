import { Transaction } from "./transaction.js";
import mempool from "../storage/mempool.js";
import blockchain from "../storage/blockchain.js";
import EncodingUtils from "../handlers/encodingUtils.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";
import Attestation from "./attestation.js";
import config from "../handlers/configHandler.js";
import DataUtils from "../utils/dataUtils.js";

export interface BlockLike {
    readonly index: string;
    hash: string;
    readonly previousHash: string;
    readonly timestamp: string;
    readonly proposer: string;
    readonly attestations: Attestation[];
    readonly transactions: Transaction[];
    readonly version: string;
}

export class Block implements BlockLike {

    public readonly index: string;
    public hash: string;
    public readonly previousHash: string;
    public readonly timestamp: string;
    public readonly proposer: string;
    public readonly attestations: Attestation[];
    public readonly transactions: Transaction[];
    public readonly version: string;

    constructor(
        index: string,
        hash: string,
        previousHash: string,
        timestamp: string,
        proposer: string,
        attestations: Attestation[],
        transactions: Transaction[],
        version = "00"
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
        let previousHash;
    
        if (!previousBlock || (typeof(previousBlock.index) !== 'number')) newIndex = "0";
        else newIndex = BigNum.add(previousBlock.index, "1");
    
        if (!previousBlock || (typeof(previousBlock.hash) !== 'string')) previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
        else previousHash = previousBlock.hash;

        const coinbase = Transaction.createCoinbaseTransaction();

        const transactions = Object.values(mempool.transactions);
        transactions.unshift(coinbase);
    
        const newBlock = new Block(
            newIndex,
            '',
            previousHash,
            new Date().getTime().toString(),
            config.staker.address,
            [],
            transactions
        );
        
        newBlock.hash = newBlock.calculateHash();

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