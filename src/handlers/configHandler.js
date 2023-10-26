const fs = require('fs');
const path = require('path');
const process = require('process');
const util = require('../utils');
const dotenv = require('dotenv');


function parseArgs() {
    // Define default argument information with default values, types, and required flags
    const defaultArgInfo = {
        'internal-port': { default: 12200, type: 'number', required: false },
        //'optional-arg': { type: 'string', required: false }, // This one is optional
    };

    // Merge provided argInfo with defaultArgInfo
    const mergedArgInfo = defaultArgInfo;

    const argsObj = {};

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
            argsObj[argName] = mergedArgInfo[argName].default;
        }
    }

    return argsObj;
}

const processArgs = parseArgs();

// Function to load the configuration file or a default if it doesn't exist
function loadNormalConfig() {
    // Define the paths for the configuration files
    const configFilePath = path.join(util.processRootDirectory, '/config/config.json');
    const defaultConfigFilePath = path.join(util.processRootDirectory, '/config/sample.config.json');

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
            return loadConfig();
        }
    } catch (error) {
        util.data_message.error('Error loading config configuration:', error);
        process.exit(1);
    }
}

function loadKnownNodesConfig() {
    const configFilePath = path.join(util.processRootDirectory, '/config/peers.json');
    const defaultConfigFilePath = path.join(util.processRootDirectory, '/config/sample.peers.json');

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
            return loadKnownNodesConfig();
        }
    } catch (error) {
        util.data_message.error('Error loading peers configuration:', error);
        process.exit(1);
    }
}

function loadENVConfig() {
    const envFilePath = path.join(util.processRootDirectory, '/config/.env');
    const defaultENVFilePath = path.join(util.processRootDirectory, '/config/sample.env');

    try {
        // Check if the configuration file exists
        if (fs.existsSync(envFilePath)) {
            // If it exists, read and parse the configuration
            dotenv.config({ path: envFilePath });

            const envData = {};

            for (let key in process.env) {
                envData[key] = process.env[key];
            }

            return envData;
        } else {
            // If it doesn't exist, read and parse the default configuration
            const defaultENVData = fs.readFileSync(defaultENVFilePath, 'utf-8');
            fs.writeFileSync(envFilePath, defaultENVData);
            return loadENVConfig();
        }
    } catch (error) {
        util.data_message.error('Error loading .env configuration:', error);
        process.exit(1);
    }
}

function loadConfig() {
    const config = { ...loadNormalConfig(), ...loadENVConfig() };

    config.peers = loadKnownNodesConfig();

    return config;
}

let config = loadConfig();

module.exports = config;