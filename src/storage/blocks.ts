import { Callbacks } from "../utils/callbacks.js";
import cli from "../utils/cli.js";
import Block from "../objects/block.js";
import fs from "fs";
import { BlockchainUtils as BCUtils} from "./blockchainUtils.js";
import path from "path";

export class BlockDB {

    private static instance: BlockDB;
  
    private constructor() {
        BCUtils.ensureDirectoryExists('/blocks');
    }
    
    public static getInstance() {
        if (!BlockDB.instance) {
            BlockDB.instance = new BlockDB();
        }
        return BlockDB.instance;
    }

    // Function to write a block
    public addBlock(block: Block, fork = "main", overwrite = false) {
        const blockIndex = block.index;
        try {
            const blockFilePath = BCUtils.getBlockchainDataFilePath(`/blocks/${blockIndex}.json`, fork);
            // Check if the block file already exists.
            if (!fs.existsSync(blockFilePath) || overwrite) {
                // Write the block data to the block file.
                fs.writeFileSync(blockFilePath, block.encodeToHex(), { encoding: 'hex'});                

                return { cb: Callbacks.SUCCESS };
            } else {
                cli.data_message.log(`Block ${blockIndex} in Fork ${fork} already exists and cannot be overwritten.`);
                return { cb: Callbacks.ERROR };
            }
        } catch (err: any) {
            cli.data_message.error(`Error writing block ${blockIndex}: ${err.message}.`);
            return { cb: Callbacks.ERROR };
        }
    }

    // Function to read a block
    public getBlock(blockIndex: string, fork = "main") {
        try {
            const blockFilePath = BCUtils.getBlockchainDataFilePath(`/blocks/${blockIndex}.json`, fork);
            if (fs.existsSync(blockFilePath)) {
                const hexData = fs.readFileSync(blockFilePath, { encoding: "hex" });
                return {cb: Callbacks.SUCCESS, data: Block.fromDecodedHex(hexData)};
            } else {
                //cli.data_message.error(`Block ${blockIndex} in Fork ${fork} was not found.`);
                return {cb: Callbacks.NONE};
            }
        } catch (err: any) {
            cli.data_message.error(`Error reading block ${blockIndex}: ${err.message}.`);
            return {cb: Callbacks.ERROR};
        }
    }

    public getBlockInForks(index: Number, hash: String) {
    
        const forksDirectory = BCUtils.getBlockchainDataFilePath('/forks/');
    
        try {
            const forksFolders = fs.readdirSync(forksDirectory);
        
            for (const folder of forksFolders) {
                const folderPath = path.join(forksDirectory, folder);
                const blocksFolder = path.join(folderPath, 'blocks');
            
                if (fs.existsSync(blocksFolder)) {
                    const blockFilePath = path.join(blocksFolder, `${index}.json`);
            
                    if (fs.existsSync(blockFilePath)) {
                    const blockData = JSON.parse(fs.readFileSync(blockFilePath, 'utf-8'));
            
                        if (blockData.hash === hash) {
                            // Found a block with matching index and hash
                            return {cb: Callbacks.SUCCESS, data: blockData};
                        }
                    }
                }
            }
        
            // Block not found in any fork
            return {cb: Callbacks.NONE};
        } catch (err: any) {
            cli.data_message.error(`Error reading Block ${index} ${hash} in Forks: ${err.message}`);
            return {cb: Callbacks.ERROR};
        }
    }

}


export default BlockDB;