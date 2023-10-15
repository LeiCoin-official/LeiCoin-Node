const fs = require('fs');
const path = require('path');
const process = require('process');
const util = require('../utils');
const dotenv = require('dotenv');

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
            let internalPort = getInternalPort();
            if (internalPort !== null) {
                configDataJSON.port = internalPort;
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
            fs.writeFileSync(configFilePath, defaultENVData);
            return loadKnownNodesConfig();
        }
    } catch (error) {
        util.data_message.error('Error loading .env configuration:', error);
        process.exit(1);
    }
}

function loadConfig() {
    const config = { ...loadNormalConfig(), ...loadENVConfig() };

    // Check for --internal-port and extract the value
    let internalPort = getInternalPort();
    if (internalPort !== null) {
        config.api.port = internalPort;
    }

    config.knownNodes = loadKnownNodesConfig();

    return config;
}

// Function to extract the value after --internal-port
function getInternalPort() {
    const args = process.argv.slice(2);
    const internalPortIndex = args.indexOf('--api-internal-port');

    if (internalPortIndex !== -1 && internalPortIndex < args.length - 1) {
        return args[internalPortIndex + 1];
    }

    return null;
}

let config = loadConfig();

module.exports = config;