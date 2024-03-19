import utils from "../utils/index.js";
import { Transaction } from "./transaction.js";
import mempool from "../storage/mempool.js";
import blockchain from "../storage/blockchain.js";
import encodingHandlers from "../handlers/encodingHandlers.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";
import cryptoHandlers from "../handlers/cryptoHandlers.js";
import { AttestationInBlock } from "./attestation.js";
import config from "../handlers/configHandler.js";

export interface BlockLike {
    index: string;
    hash: string;
    previousHash: string;
    timestamp: string;
    proposer: string;
    attestations: AttestationInBlock[];
    transactions: Transaction[];
    readonly version: string;
}

export class Block implements BlockLike {

    public index: string;
    public hash: string;
    public previousHash: string;
    public timestamp: string;
    public proposer: string;
    public attestations: AttestationInBlock[];
    public transactions: Transaction[];
    public readonly version: string;

    constructor(
        index: string,
        hash: string,
        previousHash: string,
        timestamp: string,
        proposer: string,
        attestations: AttestationInBlock[],
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
        
        const previousBlock = blockchain.chainstate.getChainState().latestBlockInfo;
    
        let newIndex;
        let previousHash;
    
        if (!previousBlock || (typeof(previousBlock.index) !== 'number')) newIndex = "0";
        else newIndex = BigNum.add(previousBlock.index, "1");
    
        if (!previousBlock || (typeof(previousBlock.hash) !== 'string')) previousHash = '';
        else previousHash = previousBlock.hash;

        const coinbase = Transaction.createCoinbaseTransaction();

        const transactions = Object.values(mempool.transactions);
        transactions.unshift(coinbase);
    
        const newBlock = new Block(
            newIndex,
            '',
            previousHash,
            new Date().getTime().toString(),
            config.staker.publicKey,
            [],
            transactions
        );
        
        newBlock.calculateHash();

        return newBlock;
    }

    public encodeToHex(add_empty_bytes = true) {   
    
        const encoded_index = BigNum.numToHex(this.index);
        const index_length = BigNum.numToHex(encoded_index.length);

        const encoded_timestamp = BigNum.numToHex(this.timestamp);
        const timestamp_length = BigNum.numToHex(encoded_timestamp.length);

        let encoded_attestations = BigNum.numToHex(this.attestations.length);
        for (let attestation of this.attestations) {
            encoded_attestations += attestation.encodeToHex();
        }

        let encoded_transactions = BigNum.numToHex(this.transactions.length);
        for (let transaction of this.transactions) {
            encoded_transactions += transaction.encodeToHex();
        }

        const hexData = this.version +
                        index_length +
                        encoded_index +
                        this.hash +
                        this.previousHash +
                        timestamp_length +
                        encoded_timestamp +
                        this.proposer +
                        encoded_attestations +
                        encoded_transactions;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string) {

        try {
            const returnData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "index_length", length: 2, type: "int"},
                {key: "index", length: "index_length", type: "bigint"},
                {key: "hash", length: 64},
                {key: "previousHash", length: 64},
                {key: "timestamp_length", length: 2, type: "int"},
                {key: "timestamp", length: "timestamp_length", type: "bigint"},
                {key: "proposer", length: 64},
                {key: "attestations", length: 2, type: "array", arrayFunc: AttestationInBlock.fromDecodedHex},
                {key: "transactions", length: 2, type: "array", arrayFunc: Transaction.fromDecodedHex}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                return utils.createInstanceFromJSON(Block, data);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Block from Decoded Hex: ${err.message}`);
        }

        return null;
    }

    public calculateHash() {
        this.hash = cryptoHandlers.sha256(this, ["hash"]);
    }

    public addAttestation(attestation: AttestationInBlock) {
        this.attestations.push(attestation);
    }

}

export default Block;