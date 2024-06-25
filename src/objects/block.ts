import { Transaction } from "./transaction.js";
import mempool from "../storage/mempool.js";
import blockchain from "../storage/blockchain.js";
import cli from "../cli/cli.js";
import Crypto from "../crypto/index.js";
import { DataUtils } from "../utils/dataUtils.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import { AddressHex } from "./address.js";
import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import { PX } from "./prefix.js";
import Staker from "./staker.js";
import Reward from "./reward.js";
import Slashing from "./slashing.js";

export class Block {

    public index: Uint64;
    public slotIndex: Uint64;
    public hash: Uint256;
    public previousHash: Uint256;
    public timestamp: Uint64;
    public proposer: AddressHex;
    public rewards: Reward[];
    public slashings: Slashing[];
    public transactions: Transaction[];
    public version: PX;

    constructor(
        index: Uint64,
        slotIndex: Uint64,
        hash: Uint256,
        previousHash: Uint256,
        timestamp: Uint64,
        proposer: AddressHex,
        rewards: Reward[],
        slashings: Slashing[],
        transactions: Transaction[],
        version = PX.A_00
    ) {

        this.index = index;
        this.slotIndex = slotIndex;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.proposer = proposer;
        this.rewards = rewards;
        this.slashings = slashings;
        this.transactions = transactions;
        this.version = version;

    }

    public static createNewBlock(slotIndex: Uint64, staker: Staker, watingRewards: Reward[], watingSlashings: Slashing[]) {
        
        const previousBlock = blockchain.chainstate.getLatestBlockInfo();
    
        let newIndex: Uint64;
        let previousHash: Uint256;
    
        if (!previousBlock || (typeof(previousBlock.index) !== 'number')) newIndex = Uint64.alloc();
        else newIndex = previousBlock.index, "1";
    
        if (!previousBlock || (typeof(previousBlock.hash) !== 'string')) previousHash = Uint256.alloc();
        else previousHash = previousBlock.hash;

        //const coinbase = Transaction.createCoinbaseTransaction(staker);

        const transactions = Object.values(mempool.transactions);
        //transactions.unshift(coinbase);
    
        const newBlock = new Block(
            newIndex,
            slotIndex,
            Uint256.alloc(),
            previousHash,
            Uint64.from(new Date().getTime()),
            staker.address,
            watingRewards,
            watingSlashings,
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
        {key: "rewards", type: "array", length: 1, encodeFunc: Reward.prototype.encodeToHex, decodeFunc: Reward.fromDecodedHex},
        {key: "slashings", type: "array", length: 1, encodeFunc: Slashing.prototype.encodeToHex, decodeFunc: Slashing.fromDecodedHex},
        {key: "transactions", type: "array", length: 1, encodeFunc: Transaction.prototype.encodeToHex, decodeFunc: Transaction.fromDecodedHex}
    ]

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(true));
    }

}

export default Block;