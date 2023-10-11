const fs = require('fs');
const path = require('path');
const process = require('process');

const processRootDirectory = process.cwd();

// Function to load the configuration file or a default if it doesn't exist
function loadConfig() {
    // Define the paths for the configuration files
    const configFilePath = path.join(processRootDirectory, '/config/config.json');
    const defaultConfigFilePath = path.join(processRootDirectory, '/config/sample.config.json');

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
        console.error('Error loading configuration:', error);
        process.exit(1);
    }
}

// Function to extract the value after --internal-port
function getInternalPort() {
    const args = process.argv.slice(2);
    const internalPortIndex = args.indexOf('--internal-port');

    if (internalPortIndex !== -1 && internalPortIndex < args.length - 1) {
        return args[internalPortIndex + 1];
    }

    return null;
}

const config = loadConfig();

module.exports = {
    config,
    processRootDirectory
}