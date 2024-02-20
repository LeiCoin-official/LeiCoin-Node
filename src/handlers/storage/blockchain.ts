import utils from "../../utils/utils.js";
import fs from "fs";
import path from "path";
import mempool, { MempoolWithUnconfirmedUTXOS } from "./mempool.js";
import Block from "../../objects/block.js";
import { Callbacks } from "../../utils/callbacks.js";
import { LatestBlockInfo } from "./fileDataStructures.js";
import cli from "../../utils/cli.js";

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
        this.ensureDirectoryExists('/indexes');
        this.ensureDirectoryExists('/forks');
    
        this.ensureFileExists('/indexes/latestblockinfo.json', '{"main": {"previousBlockInfo": {}, "latestBlockInfo": {}}}');
        this.ensureFileExists('/indexes/transactions.json', '[]');
    }
    
    
    private getBlockchainDataFilePath(subpath: string) {
        return path.join(utils.processRootDirectory, '/blockchain_data' + subpath);
    }
    
    // Function to ensure the existence of a directory
    private ensureDirectoryExists(directoryPath: string) {
        const fullDirectoryPath = this.getBlockchainDataFilePath(directoryPath);
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
    private ensureFileExists(filePath: string, content = '') {
        const fullFilePath = this.getBlockchainDataFilePath(filePath);
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
    
    // Function to read a transaction
    public getTransaction(txID: any) {
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
    
    // Function to write a UTXO
    public addUTXOS(transactionData: { txid: any; output?: any; recipientAddress?: any; index?: any; amount?: any; }, coinbase = false) {
    
        function addUTXOSpecificly(instance: Blockchain, output: {recipientAddress: any; index: any; amount: any; }, txid: any) {
            const recipientAddress = output.recipientAddress;
            try {
    
                const directoryPath = `/utxos/${recipientAddress.slice(0, 2)}`;
                const filePath = `${recipientAddress.slice(2, 4)}.json`;
        
                // Ensure the existence of the directory and file for the recipient
                instance.ensureFileExists(`${directoryPath}/${filePath}`, '{}');
    
                // Read existing UTXOs from the recipient's file
                const fullFilePath = instance.getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs = JSON.parse(existingData);
    
                if (!existingUTXOs[recipientAddress]) existingUTXOs[recipientAddress] = {};
    
                // Add UTXOs to the recipient's file
                existingUTXOs[recipientAddress][`${txid}_${output.index}`] = {
                    amount: output.amount
                };
    
                // Write the updated UTXOs back to the recipient's file
                fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2));
            } catch (err: any) {
                cli.data_message.error(`Error writing UTXOs for recipient address ${recipientAddress}: ${err.message}`);
                return { cb: Callbacks.ERROR };
            }
        }
    
        if (coinbase) {
    
            const coinbaseData = {
                recipientAddress: transactionData.recipientAddress,
                index: transactionData.index,
                amount: transactionData.amount
            };
            addUTXOSpecificly(this, coinbaseData, transactionData.txid);
    
        } else {
            // Iterate through the recipients in the output array
            for (const output of transactionData.output) {
                addUTXOSpecificly(this, output, transactionData.txid);
            }
        }
    
        return { cb: Callbacks.SUCCESS };
    }
    
    // Function to read a UTXO
    public getUTXOS(recipientAddress: string, utxoid: string | null = null) {
    
        try {
    
            const directoryPath = `/utxos/${recipientAddress.slice(0, 2)}`;
            const filePath = `${recipientAddress.slice(2, 4)}.json`;
    
            // Check if the UTXO file for the address exists
            const fullFilePath = this.getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
            if (fs.existsSync(fullFilePath)) {
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs = JSON.parse(existingData);
    
                if (mempool instanceof MempoolWithUnconfirmedUTXOS) {
                    if (mempool.deleted_utxos[recipientAddress]) {
                        for (const [utxoid, ] of Object.entries(mempool.deleted_utxos[recipientAddress])) {
                            delete existingUTXOs[recipientAddress][utxoid];
                        }
                    }
                    if (mempool.added_utxos[recipientAddress]) {
                        for (const [added_utxo, added_utxo_content] of Object.entries(mempool.added_utxos[recipientAddress])) {
                            existingUTXOs[recipientAddress][added_utxo] = added_utxo_content;
                        }
                    }
                }
    
                if (!existingUTXOs[recipientAddress]) {
                    return { cb: Callbacks.NONE};
                }
    
                if (utxoid === null) {
                    return { cb: Callbacks.SUCCESS, data: existingUTXOs[recipientAddress] };
                }
    
                if (utxoid !== null) {
                    const utxo = existingUTXOs[recipientAddress][utxoid];
                
                    if (utxo) {
                        return { cb: Callbacks.SUCCESS, data: utxo };
                    }
                }
    
                return { cb: Callbacks.NONE};
            } else {
                return { cb: Callbacks.NONE};
            }
        } catch (err: any) {
            cli.data_message.error(`Error reading UTXOs for recipient address ${recipientAddress}: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }
    
    
    // Function to delete a UTXO
    public deleteUTXOS(transactionData: { senderAddress: any; input: any; }) {
    
        try {
    
            const senderAddress = transactionData.senderAddress;
    
            const directoryPath = `/utxos/${senderAddress.slice(0, 2)}`;
            const filePath = `${senderAddress.slice(2, 4)}.json`;
    
            // Check if the UTXO file for the address exists
            const fullFilePath = this.getBlockchainDataFilePath(`${directoryPath}/${filePath}`);
            if (fs.existsSync(fullFilePath)) {
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs = JSON.parse(existingData);
    
                if (!existingUTXOs[senderAddress]) {
                    return { cb: Callbacks.NONE };
                }
    
                for (const input of transactionData.input) {
    
                    // Find the UTXO to delete
                    const utxoKey = `${input.txid}_${input.index}`;
                    if (existingUTXOs[senderAddress][utxoKey]) {
                        // Remove the UTXO from the object
                        delete existingUTXOs[senderAddress][utxoKey];
                    }
                }
    
                // Update the UTXO file
                fs.writeFileSync(fullFilePath, JSON.stringify(existingUTXOs, null, 2), 'utf8');
    
                return { cb: Callbacks.SUCCESS };
                
            }
    
            return { cb: Callbacks.NONE };
        } catch (err: any) {
            cli.data_message.error(`Error deleting UTXO: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
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
    
    public updateLatestBlockInfo(fork = "main", latestBlockInfo: { index: number, hash: string }, parentfork = "main") {
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
        


    public isGenesisBlock() {
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
                    } else if ((latestBlockInfo !== null) && (latestBlockInfo !== undefined)) {
                        if (typeof(latestBlockInfo) === "object") {
                            if (((latestBlockInfo.index !== null) && (latestBlockInfo.index !== undefined)) && ((latestBlockInfo.hash !== null) && (latestBlockInfo.hash !== undefined))) {
                                return { isGenesisBlock: true, isForkOFGenesisBlock: true };
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

    
    // Function to write a block
    public addBlock(block: Block) {
        const blockNumber = block.index;
        const blockHash = block.hash;
        const blockFilePath = this.getBlockchainDataFilePath(`/blocks/${blockNumber}.json`);
        const blocksListFilePath = this.getBlockchainDataFilePath('/indexes/blocks.json');

        try {
            // Check if the block file already exists.
            if (!fs.existsSync(blockFilePath)) {
                // Write the block data to the block file.
                fs.writeFileSync(blockFilePath, JSON.stringify(block), { encoding: 'utf8', flag: 'w' });

                // Update the list of blocks.
                const blocksListData = fs.readFileSync(blocksListFilePath, 'utf8');
                const blocksList = JSON.parse(blocksListData);
                blocksList.push({ hash: blockHash, index: blockNumber });
                fs.writeFileSync(blocksListFilePath, JSON.stringify(blocksList), { encoding: 'utf8', flag: 'w' });

                return { cb: Callbacks.SUCCESS };
            } else {
                cli.data_message.error(`Block ${blockNumber} already exists and cannot be overwritten.`);
                return { cb: Callbacks.ERROR };
            }
        } catch (err: any) {
            cli.data_message.error(`Error writing block ${blockNumber}: ${err.message}.`);
            return { cb: Callbacks.ERROR };
        }
    }

    // Function to read a block
    public getBlock(blockIndex: number) {
        const blockFilePath = this.getBlockchainDataFilePath(`/blocks/${blockIndex}.json`);
        try {
            if (fs.existsSync(blockFilePath)) {
                const data = fs.readFileSync(blockFilePath, 'utf8');
                return {cb: Callbacks.SUCCESS, block: Block.initFromJSON(JSON.parse(data))};
            } else {
                cli.data_message.error(`Block ${blockIndex} was not found.`);
                return {cb: Callbacks.NONE};
            }
        } catch (err: any) {
            cli.data_message.error(`Error reading block ${blockIndex}: ${err.message}.`);
            return {cb: Callbacks.ERROR};
        }
    }
}

export default Blockchain.getInstance();