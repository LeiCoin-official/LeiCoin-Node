import { Callbacks } from "../utils/callbacks";
import fs from "fs";
import cli from "../utils/cli.js";
import { BlockchainUtils as BCUtils} from "./blockchainUtils.js";
import EncodingUtils from "../handlers/encodingHandlers";
import Block, { BlockLike } from "../objects/block.js"

export interface SingleChainstateData {
    parent: {
        name: string;
        base: {
            index: string;
            hash: string;
        }
    };
    previousBlockInfo: {
        index: string;
        hash: string;
    };
    latestBlockInfo: BlockLike;
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
        BCUtils.ensureFileExists('/chianstate.dat', EncodingUtils.stringToHex(JSON.stringify(
            {
                version: "00",
                chains: {
                    main: {
                        parent: {
                            name: "main",
                            base: {}
                        },
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

            const data = EncodingUtils.hexToString(hexData);            

            return {cb: Callbacks.SUCCESS, data: JSON.parse(data)};
        } catch (err: any) {
            cli.data_message.error(`Error reading latest block info: ${err.message}`);
            return {cb: Callbacks.ERROR, data: { version: "00", chains: {} }};
        }
    }
    
    private updateChainStateFile() {
        try {

            const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.dat`);

            const hexData = EncodingUtils.stringToHex(JSON.stringify(this.chainStateData));
    
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

    public updateLatestBlockInfo(latestBlockInfo: BlockLike, chain = "main", parentChain = "main") {

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

    public checkNewBlockExisting(index: string, hash: string) {
        try {
            const latestBlockInfoData = this.chainStateData.chains;

            for (const [, forkLatestBlockData] of Object.entries(latestBlockInfoData)) {
                if (forkLatestBlockData?.latestBlockInfo?.hash === hash && forkLatestBlockData?.latestBlockInfo?.index === index) {
                    return { cb: true };
                }
            }

        } catch (err: any) {
            cli.data_message.error(`Error checking Block existing: ${err.message}.`);
        }
        return { cb: false };
    }

    public isValidGenesisBlock(hash: string) {
        try {
    
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
        } catch (err: any) {
            cli.data_message.error(`Error checking for existing blocks: ${err.message}`);
            return { isGenesisBlock: false, isForkOFGenesisBlock: false };
        }
    }
}

export default Chainstate;