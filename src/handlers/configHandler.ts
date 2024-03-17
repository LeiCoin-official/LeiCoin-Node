import fs from "fs";
import path from "path";
import process from "process";
import utils from "../utils/utils.js";
import dotenv from "dotenv";
import cli from "../utils/cli.js";

interface DefaultConfigInterface {
    api: {
        active: boolean;
        host: string;
        port: number;
    };
    leicoin_net: {
        host: string;
        port: number;
    };
    staker: {
        active: boolean;
        publicKey: string;
        privateKey: string;
        address: string
    };
    experimental: boolean
}

interface ENVConfigInterface {
    [key: string]: any;
}

interface ConfigInterface extends DefaultConfigInterface, ENVConfigInterface {
    peers: string[];
}
  

class Config {

    private config: ConfigInterface;

    private static instance: Config;

    public static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    private constructor() {

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
            [key: string]: {default: string | number | boolean, type: string, required: boolean}
        } = {
            'internal-port': { default: 12200, type: 'number', required: false },
            'internal-host': { default: "0.0.0.0", type: 'string', required: false },
            '--experimental': { default: false, type: 'boolean', required: false }
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
                        if (type === 'number') {
                            argsObj[argName] = parseFloat(argValue);
                        } else if (type === 'string') {
                            argsObj[argName] = argValue;
                        }
                    } else if (type === 'boolean') {
                        argsObj[argName] = true;
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
                let configDataJSON: DefaultConfigInterface = JSON.parse(configData);

                // Check for internal-port and extract the value
                if (processArgs['internal-port'])
                    configDataJSON.leicoin_net.port = processArgs['internal-port'];
                if (processArgs['internal-host'])
                    configDataJSON.leicoin_net.host = processArgs['internal-host'];
                if (processArgs['--experimental'])
                    configDataJSON.experimental = processArgs['--experimental'];

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
            cli.data_message.error(`Error loading config configuration: ${error}`);
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
            cli.data_message.error(`Error loading peers configuration: ${error.message}`);
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
            cli.data_message.error(`Error loading .env configuration: ${error.message}`);
            return null;
        }
    }

}
const config = Config.getInstance().getConfig();
export default config;