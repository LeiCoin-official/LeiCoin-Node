import { Transaction } from "./transaction.js";
import mempool from "../storage/mempool.js";
import blockchain from "../storage/blockchain.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";
import Attestation from "./attestation.js";
import config from "../handlers/configHandler.js";
import { DataUtils } from "../utils/dataUtils.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import { AddressHex } from "./address.js";
import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import { PX } from "./prefix.js";
import POS from "../pos/index.js";

export class Block {

    public index: Uint64;
    public slotIndex: Uint64;
    public hash: Uint256;
    public previousHash: Uint256;
    public timestamp: Uint64;
    public proposer: AddressHex;
    public attestations: Attestation[];
    public transactions: Transaction[];
    public version: PX;

    constructor(
        index: Uint64,
        slotIndex: Uint64,
        hash: Uint256,
        previousHash: Uint256,
        timestamp: Uint64,
        proposer: AddressHex,
        attestations: Attestation[],
        transactions: Transaction[],
        version = PX.A_00
    ) {

        this.index = index;
        this.slotIndex = slotIndex;
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
    
        let newIndex: Uint64;
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
            POS.getCurrentSlot().index,
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

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(this, Block.encodingSettings, forHash).data;
    }

    public static fromDecodedHex(hexData: Uint, returnLength = false) {

        try {
            const returnData = ObjectEncoding.decode(hexData, Block.encodingSettings, returnLength);

            const data = returnData.data;
        
            if (data && data.version.eq(0)) {
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

    private static encodingSettings: EncodingSettings[] = [
        {key: "version"},
        {key: "index"},
        {key: "slotIndex"},
        {key: "hash", hashRemove: true},
        {key: "previousHash", type: "hash"},
        {key: "timestamp"},
        {key: "proposer", type: "address"},
        {key: "attestations", type: "array", length: 1, encodeFunc: Attestation.prototype.encodeToHex, decodeFunc: Attestation.fromDecodedHex},
        {key: "transactions", type: "array", length: 1, encodeFunc: Transaction.prototype.encodeToHex, decodeFunc: Transaction.fromDecodedHex}
    ]

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(true));
    }

    public addAttestation(attestation: Attestation) {
        this.attestations.push(attestation);
    }

}

export default Block;