import { Callbacks } from "../utils/callbacks";
import { ChainstateData } from "./fileDataStructures";
import fs from "fs";
import cli from "../utils/cli.js";
import { BlockchainUtils as BCUtils} from "./blockchainUtils.js";
import EncodingUtils from "../handlers/encodingHandlers";

export class Chainstate {

    private static instance: Chainstate;
    
    private readonly chainStateData: ChainstateData;
  
    private constructor() {
        BCUtils.ensureFileExists('/chianstate.dat', EncodingUtils.stringToHex('{"main": {"previousBlockInfo": {}, "latestBlockInfo": {}}}'), "hex");
        this.chainStateData = this.getChainStateFile().data;
    }
    
    public static getInstance() {
        if (!Chainstate.instance) {
            Chainstate.instance = new Chainstate();
        }
        return Chainstate.instance;
    }

    private getChainStateFile(): {cb: Callbacks, data: ChainstateData} {
        const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.dat`);
        try {
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
    
            fs.writeFileSync(latestBlockInfoFilePath, hexData, { encoding:'hex' });
            return {cb: Callbacks.SUCCESS};
        } catch (err: any) {
            cli.data_message.error(`Error updating Chainstate File: ${err.message}`);
            return {cb: Callbacks.ERROR};
        }
    }

    public getChainState() {
        return this.chainStateData.chains;
    }

    public updateChainState(latestBlockInfo: { index: string, hash: string }, fork = "main", parentfork = "main") {

        try {
            
            const previousBlockInfo = this.chainStateData.chains[parentfork].latestBlockInfo;

            this.chainStateData.chains[fork] = {
                "previousBlockInfo": previousBlockInfo,
                "latestBlockInfo": latestBlockInfo
            };
            
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
    
            const latestblockinfoFileData = this.chainStateData.chains;
    
            const latestANDPreviousForkBlockInfo = latestblockinfoFileData.main || {};
            if ((latestANDPreviousForkBlockInfo !== null) && (latestANDPreviousForkBlockInfo !== undefined)) {
    
                const previousBlockInfo = latestANDPreviousForkBlockInfo.previousBlockInfo || null;
                const latestBlockInfo = latestANDPreviousForkBlockInfo.latestBlockInfo || null;
    
                if ((previousBlockInfo !== null) && (previousBlockInfo !== undefined)) {
                    if (typeof(previousBlockInfo) === "object") {
                        if (((previousBlockInfo.index !== null) && (previousBlockInfo.index !== undefined)) && ((previousBlockInfo.hash !== null) && (previousBlockInfo.hash !== undefined))) {
                            return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                        }
                    }
                }
                if ((latestBlockInfo !== null) && (latestBlockInfo !== undefined)) {
                    if (typeof(latestBlockInfo) === "object") {
                        if (((latestBlockInfo.index !== null) && (latestBlockInfo.index !== undefined)) && ((latestBlockInfo.hash !== null) && (latestBlockInfo.hash !== undefined))) {
                            if (latestBlockInfo.hash !== hash)
                                return { isGenesisBlock: true, isForkOFGenesisBlock: true };
                            return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                        }
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