import utils from "../utils/utils.js";
import fs from "fs";
import path from "path";
import mempool, { MempoolWithUnconfirmedUTXOS } from "./mempool.js";
import Block from "../objects/block.js";
import { Callbacks } from "../utils/callbacks.js";
import { LatestBlockInfo, UTXOFileData } from "./fileDataStructures.js";
import cli from "../utils/cli.js";
import Transaction from "../objects/transaction.js";

class Blockchain {

    private static instance: Blockchain;
  
    private constructor() {
        this.createStorageIfNotExists();
    }
    
    public static getInstance(): Blockchain {
        if (!Blockchain.instance) {
            Blockchain.instance = new Blockchain();
        }
        return Blockchain.instance;
    }

    private createStorageIfNotExists() {
        this.ensureDirectoryExists('/blocks');
        this.ensureDirectoryExists('/utxos');
        this.ensureDirectoryExists('/forks');
    
        this.ensureFileExists('/indexes/latestblockinfo.json', '{"main": {"previousBlockInfo": {}, "latestBlockInfo": {}}}');
    }
    
    
    private getBlockchainDataFilePath(subpath: string, fork = "main") {

        let forkpath = "";
        if (fork !== "main") {
            forkpath = `/forks/${fork}`;
        }

        return path.join(utils.processRootDirectory, '/blockchain_data' + forkpath + subpath);
    }
    
    // Function to ensure the existence of a directory
    private ensureDirectoryExists(directoryPath: string, fork = "main") {
        const fullDirectoryPath = this.getBlockchainDataFilePath(directoryPath, fork);
        try {
            if (!fs.existsSync(fullDirectoryPath)) {
                fs.mkdirSync(fullDirectoryPath, { recursive: true });
                cli.data_message.log(`Directory ${directoryPath} was created because it was missing.`);
            }
        } catch (err: any) {
            cli.data_message.error(`Error ensuring the existence of a directory at ${directoryPath}: ${err.message}`);
        }
    }
    
    // Function to ensure the existence of a file
    private ensureFileExists(filePath: string, content = '', fork = "main") {
        const fullFilePath = this.getBlockchainDataFilePath(filePath, fork);
        try {
            const dir = path.dirname(fullFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                cli.data_message.log(`Directory ${dir} was created because it was missing.`);
            }
            if (!fs.existsSync(fullFilePath)) {
                fs.writeFileSync(fullFilePath, content, 'utf8');
                cli.data_message.log(`File ${filePath} was created because it was missing.`);
            }
        } catch (err: any) {
            cli.data_message.error(`Error ensuring the existence of a file at ${filePath}: ${err.message}`);
        }
    }
    
    /*
    // Function to check if a file is empty or contains an empty JSON object or array
    private isFileNotEmpty(filePath: any, jsonFormat = '[]') {
        try {
            const content = fs.readFileSync(this.getBlockchainDataFilePath(filePath), 'utf8');
            let jsonData;
            try {
                jsonData = JSON.parse(content);
            } catch (err: any) {
                jsonData = JSON.parse(jsonFormat);
                this.ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
            }
    
            if (Array.isArray(jsonData)) {
                return jsonData.length > 0;
            } else if (typeof jsonData === 'object') {
                return Object.keys(jsonData).length > 0;
            }
            return false;
        } catch (err: any) {
            const jsonData = JSON.parse(jsonFormat);
            this.ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
            return true;
        }
    }
    
    // Function to check if a directory is empty
    private isDirectoryNotEmpty(directoryPath: any) {
        try {
            const fullDirectoryPath = this.getBlockchainDataFilePath(directoryPath);
            const files = fs.readdirSync(fullDirectoryPath);
            return files.length > 0;
        } catch (err: any) {
            this.ensureDirectoryExists(directoryPath);
        }
    }
    */

    // Function to write a block
    public addBlock(block: Block, fork = "main", overwrite = false) {
        const blockIndex = block.index;
        const blockFilePath = this.getBlockchainDataFilePath(`/blocks/${blockIndex}.json`, fork);

        try {
            // Check if the block file already exists.
            if (!fs.existsSync(blockFilePath) || overwrite) {
                // Write the block data to the block file.
                fs.writeFileSync(blockFilePath, JSON.stringify(block), { encoding: 'utf8', flag: 'w' });

                return { cb: Callbacks.SUCCESS };
            } else {
                cli.data_message.error(`Block ${blockIndex} in Fork ${fork} already exists and cannot be overwritten.`);
                return { cb: Callbacks.ERROR };
            }
        } catch (err: any) {
            cli.data_message.error(`Error writing block ${blockIndex}: ${err.message}.`);
            return { cb: Callbacks.ERROR };
        }
    }

    // Function to read a block
    public getBlock(blockIndex: number, fork = "main") {
        const blockFilePath = this.getBlockchainDataFilePath(`/blocks/${blockIndex}.json`, fork);
        try {
            if (fs.existsSync(blockFilePath)) {
                const data = fs.readFileSync(blockFilePath, 'utf8');
                return {cb: Callbacks.SUCCESS, data: Block.initFromJSON(JSON.parse(data))};
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
    
        const forksDirectory = this.getBlockchainDataFilePath('/forks/');
    
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

    public checkNewBlockExisting(index: number, hash: string) {
        try {
            const latestBlockInfoData = this.getLatestBlockInfo().data;

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
    
    public getLatestBlockInfo(): {cb: Callbacks, data: LatestBlockInfo} {
        const latestBlockInfoFilePath = this.getBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
        try {
            const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
            return {cb: Callbacks.SUCCESS, data: JSON.parse(data)}
        } catch (err: any) {
            cli.data_message.error(`Error reading latest block info: ${err.message}`);
            return {cb: Callbacks.ERROR, data: {}}
        }
    }
    
    public updateLatestBlockInfo(latestBlockInfo: { index: number, hash: string }, fork = "main", parentfork = "main") {
        const latestBlockInfoFilePath = this.getBlockchainDataFilePath(`/indexes/latestblockinfo.json`);
        try {
    
            const latestBlockInfoFileData = this.getLatestBlockInfo().data;

            const previousBlockInfo = latestBlockInfoFileData[parentfork].latestBlockInfo;

            latestBlockInfoFileData[fork] = {
                "previousBlockInfo": previousBlockInfo,
                "latestBlockInfo": latestBlockInfo
            };
    
            fs.writeFileSync(latestBlockInfoFilePath, JSON.stringify(latestBlockInfoFileData), {encoding:'utf8',flag:'w'});
            return {cb: Callbacks.SUCCESS};
        } catch (err: any) {
            cli.data_message.error(`Error writing latest block info: ${err.message}`);
            return {cb: Callbacks.ERROR};
        }
    }

    public isValidGenesisBlock(hash: string) {
        try {
    
            const latestblockinfoFileData = this.getLatestBlockInfo();
    
            if (latestblockinfoFileData.cb === Callbacks.SUCCESS) {
                const latestANDPreviousForkBlockInfo = latestblockinfoFileData.data.main || {};
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
                                cli.data_message.log(`DEBUG: latestBlockInfo.hash: ${latestBlockInfo.hash} hash: ${hash}`);
                                if (latestBlockInfo.hash !== hash)
                                    return { isGenesisBlock: true, isForkOFGenesisBlock: true };
                                return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                            }
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
    
    public addTransactionsToIndex(txID: string, block: number, indexInBlock: number) {
        try {
            const filePath = `/utxos/${txID.slice(0, 4)}/${txID.slice(4, 8)}/${txID.slice(8, 12)}.json`;
            const fullFilePath = this.getBlockchainDataFilePath(filePath);
            const slicedTxID = txID.slice(12, txID.length);

            this.ensureFileExists(filePath, "{}");

            //fs.

            return { cb: Callbacks.SUCCESS };
        } catch (err: any) {
            cli.data_message.error(`Error adding transaction to indexes ${txID}: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }

    // Function to read a transaction
    public getTransaction(txID: string) {
        const txFilePath = this.getBlockchainDataFilePath(`/transactions/${txID}.json`);
        try {
            if (fs.existsSync(txFilePath)) {
                const data = fs.readFileSync(txFilePath, 'utf8');
                return {cb: Callbacks.SUCCESS, data: JSON.parse(data)}
            } else {
                cli.data_message.error(`Transaktion ${txID} was not found`);
                return {cb: Callbacks.NONE}
            }
        } catch (err: any) {
            cli.data_message.error(`Error reading transaction ${txID}: ${err.message}`);
            return {cb: Callbacks.ERROR};
        }
    }

    private getUTXOFilePath(address: string) {
        return `/utxos/${address.slice(0, 4)}/${address.slice(4, 8)}/${address.slice(8, 12)}.json`;
    }
    
    // Function to write a UTXO
    public addUTXOS(transactionData: Transaction) {

        // Iterate through the recipients in the output array
        for (const [index, output] of transactionData.output.entries()) {
            const recipientAddress = output.recipientAddress;
            try {
    
                const utxoFilePath = this.getUTXOFilePath(recipientAddress);

                const slicedAddress = recipientAddress.slice(12, recipientAddress.length);
        
                // Ensure the existence of the directory and file for the recipient
                this.ensureFileExists(utxoFilePath, '{}');
    
                // Read existing UTXOs from the recipient's file
                const fullFilePath = this.getBlockchainDataFilePath(utxoFilePath);
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs: UTXOFileData = JSON.parse(existingData);
    
                if (!existingUTXOs[slicedAddress]) existingUTXOs[slicedAddress] = {};
    
                // Add UTXOs to the recipient's file
                existingUTXOs[slicedAddress][`${transactionData.txid}_${index}`] = {
                    amount: output.amount
                };
    
                // Write the updated UTXOs back to the recipient's file
                fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs));
            } catch (err: any) {
                cli.data_message.error(`Error writing UTXOs for recipient address ${recipientAddress}: ${err.message}`);
                return { cb: Callbacks.ERROR };
            }
        }
    
        return { cb: Callbacks.SUCCESS };
    }
    
    // Function to read a UTXO
    public getUTXOS(address: string, utxoid: string | null = null) {
    
        try {
    
            const utxoFilePath = this.getUTXOFilePath(address);

            const slicedAddress = address.slice(12, address.length);
    
            // Check if the UTXO file for the address exists
            const fullFilePath = this.getBlockchainDataFilePath(utxoFilePath);
            if (fs.existsSync(fullFilePath)) {
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs: UTXOFileData = JSON.parse(existingData);
                const addressUTXOs = existingUTXOs[slicedAddress];

                if (!addressUTXOs) {
                    return { cb: Callbacks.NONE };
                }

                if (mempool instanceof MempoolWithUnconfirmedUTXOS) {
                    if (mempool.deleted_utxos[address]) {
                        for (const [utxoid, ] of Object.entries(mempool.deleted_utxos[address])) {
                            delete addressUTXOs[utxoid];
                        }
                    }
                    if (mempool.added_utxos[address]) {
                        for (const [added_utxo, added_utxo_content] of Object.entries(mempool.added_utxos[address])) {
                            addressUTXOs[added_utxo] = added_utxo_content;
                        }
                    }
                }
    
                if (utxoid === null) {
                    return { cb: Callbacks.SUCCESS, data: addressUTXOs };
                } else {
                    const utxo = addressUTXOs[utxoid];
                
                    if (utxo) {
                        return { cb: Callbacks.SUCCESS, data: utxo };
                    }
                }
    
                return { cb: Callbacks.NONE };
            } else {
                return { cb: Callbacks.NONE };
            }
        } catch (err: any) {
            cli.data_message.error(`Error reading UTXOs for recipient address ${address}: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }
    
    
    // Function to delete a UTXO
    public deleteUTXOS(transactionData: Transaction) {
    
        try {
    
            const senderAddress = transactionData.senderAddress;

            const slicedAddress = senderAddress.slice(12, senderAddress.length);
    
            const utxoFilePath = this.getUTXOFilePath(senderAddress);
    
            // Check if the UTXO file for the address exists
            const fullFilePath = this.getBlockchainDataFilePath(utxoFilePath);
            if (fs.existsSync(fullFilePath)) {
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs = JSON.parse(existingData) as UTXOFileData;

                if (!existingUTXOs[slicedAddress]) {
                    return { cb: Callbacks.NONE };
                }
        
                for (const input of transactionData.input) {
        
                    if (existingUTXOs[slicedAddress][input.utxoid]) {
                        // Remove the UTXO from the object
                        delete existingUTXOs[slicedAddress][input.utxoid];
                    }
                }

                fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs), 'utf8');

                return { cb: Callbacks.SUCCESS };
            }
    
            return { cb: Callbacks.NONE };
        } catch (err: any) {
            cli.data_message.error(`Error deleting UTXO: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }

    public createFork(name: string) {
        this.ensureDirectoryExists("/blocks", name);
    }

    public transferForkToMain(fork: string) {

        try {

            const tempBlockchain = {};

            const forkBlocks = fs.readdirSync(this.getBlockchainDataFilePath("/blocks", fork));

            forkBlocks.sort((a: string, b: string) => {
                const numA = parseInt(a.split('.')[0]);
                const numB = parseInt(b.split('.')[0]);
                return numA - numB;
            });

            for (const blockFile of forkBlocks) {

                const blockIndex = parseInt(blockFile.split('.')[0]);

                const block = this.getBlock(blockIndex, fork).data;
                if (!block) {
                    return { cb: Callbacks.ERROR };
                }

                const blockInMain = this.getBlock(blockIndex);

            }

            return { cb: Callbacks.SUCCESS };

        } catch (err: any) {
            cli.data_message.error(`Error transfering Fork ${fork} to Main Blockchain: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }

    }

    public deleteFork(name: string) {
        
    }

}

export default Blockchain.getInstance();