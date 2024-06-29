import path from "path";
import fs from "fs";
import cli from "../cli/cli.js";
import utils from "../utils/index.js";
import EncodingUtils from "../encoding/index.js";
import { Callbacks } from "../utils/callbacks.js";

class BCUtils {

    public static getBlockchainDataFilePath(subpath: string, fork = "main") {

        let forkpath = "";
        if (fork !== "main") {
            forkpath = `/forks/${fork}`;
        }

        return path.join(utils.processRootDirectory, '/blockchain_data' + forkpath + subpath);
    }
    
    // Function to ensure the existence of a directory
    public static ensureDirectoryExists(directoryPath: string, fork = "main") {
        const fullDirectoryPath = this.getBlockchainDataFilePath(directoryPath, fork);
        try {
            if (!fs.existsSync(fullDirectoryPath)) {
                fs.mkdirSync(fullDirectoryPath, { recursive: true });
                cli.data.info(`Directory ${directoryPath} was created because it was missing.`);
            }
        } catch (err: any) {
            cli.data.error(`Error ensuring the existence of a directory at ${directoryPath}: ${err.message}`);
        }
    }
    
    // Function to ensure the existence of a file
    public static ensureFileExists(filePath: string, content = '', encoding: BufferEncoding = "utf8", fork = "main") {
        const fullFilePath = this.getBlockchainDataFilePath(filePath, fork);
        try {
            const dir = path.dirname(fullFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                cli.data.info(`Directory ${dir} was created because it was missing.`);
            }
            if (!fs.existsSync(fullFilePath)) {
                fs.writeFileSync(fullFilePath, content, { encoding });
                cli.data.info(`File ${filePath} was created because it was missing.`);
            }
        } catch (err: any) {
            cli.data.error(`Error ensuring the existence of a file at ${filePath}: ${err.message}`);
        }
    }
    
    // Function to check if a file is empty or contains an empty JSON object or array
    public static isFileNotEmpty(filePath: any, jsonFormat = '[]') {
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
    public static isDirectoryNotEmpty(directoryPath: any) {
        try {
            const fullDirectoryPath = this.getBlockchainDataFilePath(directoryPath);
            const files = fs.readdirSync(fullDirectoryPath);
            return files.length > 0;
        } catch (err: any) {
            this.ensureDirectoryExists(directoryPath);
        }
    }

}

export { BCUtils as BlockchainUtils };
export default BCUtils;
