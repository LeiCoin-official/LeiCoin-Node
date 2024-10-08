import { CB } from "../utils/callbacks.js";
import fs from "fs";
import cli from "../cli/cli.js";
import BCUtils from "./blockchainUtils.js";
import EncodingUtils from "../encoding/index.js";
import Block from "../objects/block.js"
import { Uint, Uint256, Uint64 } from "../binary/uint.js";

export interface SingleChainstateData {
    parent: {
        name: string;
    };
    base: Block;
    previousBlockInfo: Block;
    latestBlockInfo: Block;
}


export interface ChainstateData {
    version: string;
    chains: {
        [fork: string]: SingleChainstateData
    }
}

export class Chainstate {

    private static instance: Chainstate;
    
    private readonly chainStateData: ChainstateData;
  
    private constructor() {
        BCUtils.ensureFileExists('/chainstate.lcb', 'main', Uint.from(EncodingUtils.encodeStringToHex(JSON.stringify(
            {
                version: "00",
                chains: {
                    main: {
                        parent: {
                            name: "main"
                        },
                        base: {},
                        previousBlockInfo: {},
                        latestBlockInfo: {},
                    }
                }
            }
        ))));
        this.chainStateData = this.getChainStateFile().data;
    }
    
    public static getInstance() {
        if (!Chainstate.instance) {
            Chainstate.instance = new Chainstate();
        }
        return Chainstate.instance;
    }

    private getChainStateFile(): {cb: CB, data: ChainstateData} {
        try {

            const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.lcb`);
            const hexData = fs.readFileSync(latestBlockInfoFilePath, { encoding: "hex" });

            const data = EncodingUtils.decodeHexToString(hexData);

            return {cb: CB.SUCCESS, data: JSON.parse(data)};
        } catch (err: any) {
            cli.data.error(`Error reading latest block info: ${err.stack}`);
            return {cb: CB.ERROR, data: { version: "00", chains: {} }};
        }
    }
    
    private updateChainStateFile() {
        try {

            const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.lcb`);
            
            const hexData = EncodingUtils.encodeStringToHex(JSON.stringify(this.chainStateData, (key, value) => {
                if (value instanceof Block) {
                    return value.encodeToHex().toHex();
                }
                return value;
            }));
    
            fs.writeFileSync(latestBlockInfoFilePath, hexData, { encoding: "hex" });
            return {cb: CB.SUCCESS};
        } catch (err: any) {
            cli.data.error(`Error updating Chainstate File: ${err.stack}`);
            return {cb: CB.ERROR};
        }
    }

    public getAllChainStates() {
        return this.chainStateData.chains;
    }

    public getChainState(chain = "main") {
        return this.chainStateData.chains[chain];
    }

    public setChainState(data: SingleChainstateData, chain = "main") {
        this.chainStateData.chains[chain] = data;
    }

    public getLatestBlockInfo(chain = "main") {
        return this.chainStateData.chains[chain].latestBlockInfo;
    }

    public updateLatestBlockInfo(latestBlockInfo: Block, chain = "main", parentChain = "main") {

        try {
            
            const previousBlockInfo = this.chainStateData.chains[parentChain].latestBlockInfo;

            this.chainStateData.chains[chain].previousBlockInfo = previousBlockInfo;
            this.chainStateData.chains[chain].latestBlockInfo = latestBlockInfo;
            
            this.updateChainStateFile();

            return {cb: CB.SUCCESS};
        } catch (err: any) {
            cli.data.error(`Error updating Chainstate: ${err.stack}`);
            return {cb: CB.ERROR};
        }

    }

    public isValidGenesisBlock(hash: Uint256) {
    
        const latestANDPreviousForkBlockInfo = this.chainStateData.chains.main;

        if (latestANDPreviousForkBlockInfo) {

            const previousBlockInfo = latestANDPreviousForkBlockInfo.previousBlockInfo;
            const latestBlockInfo = latestANDPreviousForkBlockInfo.latestBlockInfo;
    
            if (previousBlockInfo) {
                if (previousBlockInfo.index && previousBlockInfo.hash) {
                    return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                }
            }

            if (latestBlockInfo) {
                if (latestBlockInfo.index && latestBlockInfo.hash) {
                    if (latestBlockInfo.hash !== hash)
                        return { isGenesisBlock: true, isForkOFGenesisBlock: true };
                    return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                }
            }

        }
        
        return { isGenesisBlock: true, isForkOFGenesisBlock: false };
    }

    public isBlockChainStateMatching(block: Block): {
        valid: false;
        status: 400;
        message: string;
    } | {
        valid: true;
        name: string;
        type: "newfork" | "child";
        parent: string;
    } {

        for (const [chainName, chainData] of Object.entries(this.chainStateData.chains)) {

            const previousBlockInfo = chainData.previousBlockInfo;
            const latestBlockInfo = chainData.latestBlockInfo;

            if (latestBlockInfo.hash.eq(block.hash)) {

                return { valid: false, status: 400, message: 'Bad Request. Block aleady exists.' };

            } else if ((latestBlockInfo.hash === block.previousHash) && latestBlockInfo.index.add(1).eq(block.index)) {

                return { valid: true, name: chainName, type: "child", parent: chainName };

            } else if ((previousBlockInfo.hash === block.previousHash) && previousBlockInfo.index.add(1).eq(block.index)) {

                return { valid: true, name: block.hash.toHex(), type: "newfork", parent: chainName };

            }
        }

        return { valid: false, status: 400, message: 'Bad Request. Block is not a child of a valid blockchain or forkchain' };   
    }

}

export default Chainstate;