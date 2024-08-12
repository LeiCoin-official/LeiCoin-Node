import path from "path";
import fs from "fs";
import cli from "../cli/cli.js";
import utils from "../utils/index.js";
import { Uint } from "../utils/binary.js";

class BCUtils {

    private static getRelativePath(subpath: string, fork = "main") {
        let forkpath = "";
        if (fork !== "main") {
            forkpath = `/forks/${fork}`;
        }
        return '/blockchain_data' + forkpath + subpath;
    }

    public static getBlockchainDataFilePath(subpath: string, fork = "main") {
        return path.join(utils.processRootDirectory, this.getRelativePath(subpath, fork));
    }

    public static readFile(filePath: string, fork: string) {
        return new Uint(fs.readFileSync(this.getBlockchainDataFilePath(filePath, fork), null));
    }

    public static existsPath(fileORDirPath: string, fork: string) {
        return fs.existsSync(this.getBlockchainDataFilePath(fileORDirPath, fork));
    }

    public static writeFile(filePath: string, fork: string, data: Uint) {
        return fs.writeFileSync(this.getBlockchainDataFilePath(filePath, fork), data.getRaw());
    }
    
    public static mkDir(directoryPath: string, fork: string) {
        return fs.mkdirSync(this.getBlockchainDataFilePath(directoryPath, fork), { recursive: true });
    }
    
    // Function to ensure the existence of a directory
    public static ensureDirectoryExists(directoryPath: string, fork: string) {
        try {
            if (!this.existsPath(directoryPath, fork)) {
                this.mkDir(directoryPath, fork);
                cli.data.info(`Directory ${this.getRelativePath(directoryPath, fork)} was created because it was missing.`);
            }
        } catch (err: any) {
            cli.data.error(`Error ensuring the existence of a directory at ${this.getRelativePath(directoryPath, fork)}: ${err.stack}`);
        }
    }
    
    // Function to ensure the existence of a file
    public static ensureFileExists(
        filePath: string,
        fork: string,
        content: Uint
    ) {
        try {
            this.ensureDirectoryExists(path.dirname(filePath), fork)
            if (!this.existsPath(filePath, fork)) {
                this.writeFile(filePath, fork, content);
                cli.data.info(`File ${this.getRelativePath(filePath, fork)} was created because it was missing.`);
            }

        } catch (err: any) {
            cli.data.error(`Error ensuring the existence of a file at ${this.getRelativePath(filePath, fork)}: ${err.stack}`);
        }
    }
    
    // // Function to check if a file is empty or contains an empty JSON object or array
    // /** @deprecated Needs recoding */
    // public static isFileNotEmpty(filePath: string, jsonFormat = '[]') {
    //     try {
    //         const content = fs.readFileSync(this.getBlockchainDataFilePath(filePath), 'utf8');
    //         let jsonData;
    //         try {
    //             jsonData = JSON.parse(content);
    //         } catch (err: any) {
    //             jsonData = JSON.parse(jsonFormat);
    //             this.ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
    //         }
    
    //         if (Array.isArray(jsonData)) {
    //             return jsonData.length > 0;
    //         } else if (typeof jsonData === 'object') {
    //             return Object.keys(jsonData).length > 0;
    //         }
    //         return false;
    //     } catch (err: any) {
    //         const jsonData = JSON.parse(jsonFormat);
    //         this.ensureFileExists(filePath, JSON.stringify(jsonData, null, 2));
    //         return true;
    //     }
    // }
    
    // // Function to check if a directory is empty
    // /** @deprecated Needs recoding */
    // public static isDirectoryNotEmpty(directoryPath: any) {
    //     try {
    //         const fullDirectoryPath = this.getBlockchainDataFilePath(directoryPath);
    //         const files = fs.readdirSync(fullDirectoryPath);
    //         return files.length > 0;
    //     } catch (err: any) {
    //         this.ensureDirectoryExists(directoryPath);
    //     }
    // }
}

export { BCUtils as BlockchainUtils };
export default BCUtils;
