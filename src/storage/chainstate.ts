import { Callbacks } from "../utils/callbacks.js";
import fs from "fs";
import cli from "../utils/cli.js";
import { BlockchainUtils as BCUtils} from "./blockchainUtils.js";
import EncodingUtils from "../handlers/encodingUtils.js";
import Block from "../objects/block.js"

export interface SingleChainstateData {
    parent: {
        name: string;
    };
    base: {
        index: string;
        hash: string;
    };
    previousBlockInfo: {
        index: string;
        hash: string;
    };
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
        BCUtils.ensureFileExists('/chainstate.dat', EncodingUtils.encodeStringToHex(JSON.stringify(
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
        )), "hex");
        this.chainStateData = this.getChainStateFile().data;
    }
    
    public static getInstance() {
        if (!Chainstate.instance) {
            Chainstate.instance = new Chainstate();
        }
        return Chainstate.instance;
    }

    private getChainStateFile(): {cb: Callbacks, data: ChainstateData} {
        try {

            const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.dat`);
            const hexData = fs.readFileSync(latestBlockInfoFilePath, { encoding: "hex" });

            const data = EncodingUtils.decodeHexToString(hexData);            

            return {cb: Callbacks.SUCCESS, data: JSON.parse(data)};
        } catch (err: any) {
            cli.data_message.error(`Error reading latest block info: ${err.message}`);
            return {cb: Callbacks.ERROR, data: { version: "00", chains: {} }};
        }
    }
    
    private updateChainStateFile() {
        try {

            const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.dat`);

            const hexData = EncodingUtils.encodeStringToHex(JSON.stringify(this.chainStateData));
    
            fs.writeFileSync(latestBlockInfoFilePath, hexData, { encoding: "hex" });
            return {cb: Callbacks.SUCCESS};
        } catch (err: any) {
            cli.data_message.error(`Error updating Chainstate File: ${err.message}`);
            return {cb: Callbacks.ERROR};
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

            return {cb: Callbacks.SUCCESS};
        } catch (err: any) {
            cli.data_message.error(`Error updating Chainstate: ${err.message}`);
            return {cb: Callbacks.ERROR};
        }

    }

    public isValidGenesisBlock(hash: string) {
    
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

            if (latestBlockInfo.hash === block.hash) {

                return { valid: false, status: 400, message: 'Bad Request. Block aleady exists.' };

            } else if ((latestBlockInfo.hash === block.previousHash) && ((latestBlockInfo.index + 1) === block.index)) {

                return { valid: true, name: chainName, type: "child", parent: chainName };

            } else if ((previousBlockInfo.hash === block.previousHash) && ((previousBlockInfo.index + 1) === block.index)) {

                return { valid: true, name: block.hash, type: "newfork", parent: chainName };

            }
        }

        return { valid: false, status: 400, message: 'Bad Request. Block is not a child of a valid blockchain or forkchain' };   
    }

}

export default Chainstate;