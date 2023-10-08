const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Define the paths for the configuration files
const configFilePath = path.join(__dirname, 'config/config.json');
const defaultConfigFilePath = path.join(__dirname, 'config/sample.config.json');

// Function to load the configuration file or a default if it doesn't exist
function loadConfig() {
    try {
        // Check if the configuration file exists
        if (fs.existsSync(configFilePath)) {
            // If it exists, read and parse the configuration
            const configData = fs.readFileSync(configFilePath, 'utf-8');
            return JSON.parse(configData);
        } else {
            // If it doesn't exist, read and parse the default configuration
            const defaultConfigData = fs.readFileSync(defaultConfigFilePath, 'utf-8');
            fs.writeFileSync(configFilePath, defaultConfigData);
            return loadConfig();
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
        return null;
    }
}

const args = process.argv.slice(2);

// Function to extract the value after --internal-port
function getInternalPort(args) {
    const internalPortIndex = args.indexOf('--internal-port');

    if (internalPortIndex !== -1 && internalPortIndex < args.length - 1) {
        return args[internalPortIndex + 1];
    }

    return null;
}

// Check for --internal-port and extract the value
let internalPort = getInternalPort(args);
// Load the configuration
const config = loadConfig();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

if (internalPort == null) {
    internalPort = config.port;
}

app.listen(internalPort, () => {
    console.log(`App listening on port ${internalPort}`);
});
