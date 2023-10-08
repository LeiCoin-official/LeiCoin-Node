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
      loadConfig();
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
    return null;
  }
}

// Load the configuration
const config = loadConfig();

if (config) {
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(config.port, () => {
    console.log(`App listening on port ${config.port}`);
  });
} else {
  console.error('Failed to load configuration. Exiting...');
  process.exit(1);
}
