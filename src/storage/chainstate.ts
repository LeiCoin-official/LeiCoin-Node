import cli from "../cli/cli.js";
import LCrypt from "../crypto/index.js";
import { BE, DataEncoder } from "../encoding/binaryEncoders.js";
import ObjectEncoding from "../encoding/objects.js";
import Block from "../objects/block.js";
import { PX } from "../objects/prefix.js";
import { Uint, Uint256 } from "low-level";
import { CB } from "../utils/callbacks.js";
import { Dict } from "../utils/dataUtils.js";
import BCUtils from "./blockchainUtils.js";
import { Blockchain } from "./blockchain.js";


export class ForkChainstateData {
    public readonly id: string;
    public readonly stateHash: Uint256;
    public readonly parentChain: Uint256;
    public readonly base: Block;
    public latestBlock: Block;

    constructor(stateHash: Uint256, parentChain: Uint256, base: Block, latestBlock: Block) {
        this.stateHash = stateHash;
        this.parentChain = parentChain;
        this.base = base;
        this.latestBlock = latestBlock;

        if (this.base.index.eq(0)) this.id = "main";
        else this.id = this.base.hash.toHex();
    }

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(this, ForkChainstateData.encodingSettings, forHash).data;
    }

    public static fromDecodedHex(hexData: Uint, returnLength = false) {
        
        try {
            const returnData = ObjectEncoding.decode(hexData, ForkChainstateData.encodingSettings, returnLength);

            const data = returnData.data;
        
            if (data) {
                const forkChainstateData = new ForkChainstateData(
                    data.stateHash,
                    data.parentChain,
                    data.base,
                    data.latestBlock
                )

                if (returnData.length) {
                    return {data: forkChainstateData, length: returnData.length};
                }
                return forkChainstateData;
            }
        } catch (err: any) {
            cli.data.error(`Error loading ForkChainstateData from Decoded Hex: ${err.stack}`);
        }

        return null;
    }

    public calculateHash() {
        return LCrypt.sha256(this.encodeToHex(true));
    }

    private static encodingSettings: DataEncoder[] = [
        BE(Uint256, "stateHash", true),
        BE(Uint256, "parentChain"),
        BE.Object("base", Block),
        BE.Object("latestBlock", Block)
    ]

}


export class ChainstateData {
    public readonly chains: Dict<ForkChainstateData> = {};
    public readonly version: PX;

    private constructor(chains: ForkChainstateData[], version: PX) {
        for (const chain of chains) {
            this.chains[chain.id] = chain;
        }
        this.version = version;
    }

    public static createEmpty() {
        return new ChainstateData([], PX.V_00);
    }

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(
            {
                version: this.version,
                chains: Object.values(this.chains)
            },
            ChainstateData.encodingSettings,
            forHash
        ).data;
    }

    public static fromDecodedHex(hexData: Uint) {
        
        try {
            const returnData = ObjectEncoding.decode(hexData, ChainstateData.encodingSettings);

            const data = returnData.data;
        
            if (data && data.version.eq(0)) {
                return new ChainstateData(
                    data.chains,
                    data.version
                )
            }
        } catch (err: any) {
            cli.data.error(`Error loading ForkChainstateData from Decoded Hex: ${err.stack}`);
        }

        return this.createEmpty();
    }

    public calculateHash() {
        return LCrypt.sha256(this.encodeToHex(true));
    }

    private static encodingSettings: DataEncoder[] = [
        BE(PX, "version"),
        BE.Array("chains", 2, ForkChainstateData)
    ]

}

export class Chainstate {

    private static instance: Chainstate;

    public static getInstance() {
        if (!Chainstate.instance) {
            Chainstate.instance = new Chainstate();
        }
        return Chainstate.instance;
    }

    private readonly chainStateData: ChainstateData;

    private constructor() {
        BCUtils.ensureFileExists('/chainstate.lcb', "main", ChainstateData.createEmpty().encodeToHex());
        this.chainStateData = this.getChainStateFile().data;
    }

    private getChainStateFile() {
        try {
            const chainStateData = ChainstateData.fromDecodedHex(BCUtils.readFile('/chainstate.lcb', "main"));
            return {cb: CB.SUCCESS, data: chainStateData};
        } catch (err: any) {
            cli.data.error(`Error reading Chainstate File: ${err.stack}`);
            return {cb: CB.ERROR, data: ChainstateData.createEmpty()};
        }
    }
    
    public updateChainStateFile() {
        try {    
            BCUtils.writeFile('/chainstate.lcb', "main", this.chainStateData.encodeToHex());
            return {cb: CB.SUCCESS};
        } catch (err: any) {
            cli.data.error(`Error updating Chainstate File: ${err.stack}`);
            return {cb: CB.ERROR};
        }
    }


    public getCompleteChainStateData() {
        return this.chainStateData;
    }

    public getAllChainStates() {
        return this.chainStateData.chains;
    }

    public getChainState(id = "main"): ForkChainstateData | undefined {
        return this.chainStateData.chains[id];
    }

    public getLatestBlock(chainID = "main") {
        return this.getChainState(chainID)?.latestBlock;
    }

    public updateChainStateByBlock(chainID: string, parentChain: string, block: Block) {
        let chain = this.getChainState(chainID);
        if (!chain) {
            chain = new ForkChainstateData(
                Uint256.empty(),
                this.getChainState(parentChain)?.base.hash || Uint256.from(0),
                block,
                block
            );
            this.chainStateData.chains[chainID] = chain;
        } else {
            chain.latestBlock = block;
        }

        chain.stateHash.set(chain.calculateHash());
        this.updateChainStateFile();
    }


    public isBlockChainStateMatching(block: Block): {
        status: 12532 | 12533;
    } | {
        status: 12000;
        targetChain: string;
        parentChain: string;
    } {

        if (block.index.eq(0)) {
            const latestBlockInfo = this.getChainState();
            if (latestBlockInfo)
                return { status: 12533 }; // Genesis block already exists
            return { status: 12000, targetChain: "main", parentChain: "main" }; // Main Genesis block
        }

        let parentChain: ForkChainstateData | null = null;
        let previousBlock: Block | null = null;

        for (const chain of Object.values(this.getAllChainStates())) {
            const chainPreviousBlock = Blockchain.chains[chain.id].blocks.get(block.index.sub(1)).data; 

            if (chainPreviousBlock?.hash.eq(block.previousHash)) {
                parentChain = chain;
                previousBlock = chainPreviousBlock;
                break;
            }
        }

        if (!parentChain || !previousBlock)
            return { status: 12532 }; // Previous block not found

        const targetBlock = Blockchain.chains[parentChain.id].blocks.get(block.index).data;

        if (targetBlock) {
            if (targetBlock?.hash.eq(block.hash))
                return { status: 12533 }; // Block aleady exists
            return { status: 12000, targetChain: block.hash.toHex(), parentChain: parentChain.id }; // New fork
        }

        return { status: 12000, targetChain: parentChain.id, parentChain: parentChain.id }; // Child
    }

}

