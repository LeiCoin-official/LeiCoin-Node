import fs from "fs";
import path from "path";
import process from "process";
import utils from "../utils.js";
import dotenv from "dotenv";

interface DefaultConfigInterface {
    api: {
        active: boolean;
        host: string;
        port: number;
    };
    leicoin_net: {
        host: string;
        port: number;
    },
    miner: {
        active: boolean,
        number_of_threads: number,
        minerAddress: string
    }
}

interface ENVConfigInterface {
    [key: string]: any
}

interface ConfigInterface extends DefaultConfigInterface, ENVConfigInterface {
    peers: [string]
}
  

class Config {

    private config: ConfigInterface;

    constructor() {

        const processArgs = this.parseArgs();
        const defaultConfig = this.loadDefaultConfig(processArgs);
        const knownNodesConfig = this.loadKnownNodesConfig();
        const envConfig = this.loadENVConfig();

        if (!defaultConfig || !knownNodesConfig || !envConfig) {
            utils.gracefulShutdown(1);
            process.exit(0);
        } else {
            this.config = {
                ...defaultConfig,
                ...envConfig,
                peers: knownNodesConfig
            };
        }
    }

    public getConfig() {
        return this.config;
    }

    private parseArgs() {
        // Define default argument information with default values, types, and required flags
        const defaultArgInfo : {
            [key: string]: {default: string | number, type: string, required: boolean}
        } = {
            'internal-port': { default: 12200, type: 'number', required: false },
            //'optional-arg': { type: 'string', required: false }, // This one is optional
        };
    
        // Merge provided argInfo with defaultArgInfo
        const mergedArgInfo = defaultArgInfo;
    
        const argsObj: {[arg: string]: any} = {};
    
        for (const arg of process.argv.slice(2)) {
            try {
                const [argName, argValue] = arg.split('=');
    
                if (argName && mergedArgInfo[argName]) {
                    const { type, default: defaultValue } = mergedArgInfo[argName];
    
                    if (argValue !== undefined) {
                        argsObj[argName] =
                            type === 'number' ? parseFloat(argValue) : argValue;
                    }
                }
            } catch (error) {
                console.error(`Error parsing argument: ${arg}`);
            }
        }
    
        // Now, for each required argument, if it's not in argsObj, set it to the default value
        for (const argName in mergedArgInfo) {
            if (mergedArgInfo[argName].required && argsObj[argName] === undefined) {
                argsObj[argName] = mergedArgInfo[argName];
            }
        }
    
        return argsObj;
    }

    // Function to load the configuration file or a default if it doesn't exist
    private loadDefaultConfig(processArgs: {[arg: string]: any}, secondTry = false): DefaultConfigInterface | null {
        // Define the paths for the configuration files
        const configFilePath = path.join(utils.processRootDirectory, '/config/config.json');
        const defaultConfigFilePath = path.join(utils.processRootDirectory, '/config/sample.config.json');

        try {
            // Check if the configuration file exists
            if (fs.existsSync(configFilePath)) {
                // If it exists, read and parse the configuration
                const configData = fs.readFileSync(configFilePath, 'utf-8');
                let configDataJSON = JSON.parse(configData);

                // Check for --internal-port and extract the value
                let internalPort = processArgs['internal-port'];
                if (internalPort !== null && internalPort !== undefined) {
                    configDataJSON.server.port = internalPort;
                }

                return configDataJSON;
            } else {
                // If it doesn't exist, read and parse the default configuration
                const defaultConfigData = fs.readFileSync(defaultConfigFilePath, 'utf-8');
                fs.writeFileSync(configFilePath, defaultConfigData);
                if (!secondTry)
                    return this.loadDefaultConfig(processArgs, true);
                return null;

            }
        } catch (error: any) {
            utils.data_message.error(`Error loading config configuration: ${error}`);
            return null;
        }
        
    }

    private loadKnownNodesConfig(secondTry = false): [string] | null {
        const configFilePath = path.join(utils.processRootDirectory, '/config/peers.json');
        const defaultConfigFilePath = path.join(utils.processRootDirectory, '/config/sample.peers.json');

        try {
            // Check if the configuration file exists
            if (fs.existsSync(configFilePath)) {
                // If it exists, read and parse the configuration
                const configData = fs.readFileSync(configFilePath, 'utf-8');
                let configDataJSON = JSON.parse(configData);

                return configDataJSON;
            } else {
                // If it doesn't exist, read and parse the default configuration
                const defaultConfigData = fs.readFileSync(defaultConfigFilePath, 'utf-8');
                fs.writeFileSync(configFilePath, defaultConfigData);
                if (!secondTry)
                    return this.loadKnownNodesConfig(true);
                return null;
            }
        } catch (error: any) {
            utils.data_message.error(`Error loading peers configuration: ${error.message}`);
            return null;
        }
    }

    private loadENVConfig(secondTry = false): ENVConfigInterface | null {
        const envFilePath = path.join(utils.processRootDirectory, '/config/.env');
        const defaultENVFilePath = path.join(utils.processRootDirectory, '/config/sample.env');

        try {
            // Check if the configuration file exists
            if (fs.existsSync(envFilePath)) {
                // If it exists, read and parse the configuration
                dotenv.config({ path: envFilePath });

                const envData: ENVConfigInterface = {};

                for (let key in process.env) {
                    envData[key] = process.env[key];
                }

                return envData;
            } else {
                // If it doesn't exist, read and parse the default configuration
                const defaultENVData = fs.readFileSync(defaultENVFilePath, 'utf-8');
                fs.writeFileSync(envFilePath, defaultENVData);
                if (!secondTry)
                    return this.loadENVConfig(true);
                return null
            }
        } catch (error: any) {
            utils.data_message.error(`Error loading .env configuration: ${error.message}`);
            return null;
        }
    }

}
const config = new Config().getConfig();
export default config;