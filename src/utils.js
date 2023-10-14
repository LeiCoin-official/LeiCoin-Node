const process = require('process');
const chalk = require('chalk');

const processRootDirectory = process.cwd();
const mining_difficulty = 6;

function generateLogMessage(prefix, message, style = 'reset') {
    const styles = {
        reset: chalk.reset,
        green: chalk.green,
        red: chalk.red,
    };
  
    if (styles[style]) {
        return `${chalk[prefix](`[${prefix}]`)} ${styles[style](message)}`;
    } else {
        return `${chalk[prefix](`[${prefix}]`)} ${chalk.reset(message)}`;
    }
}
  
const messageTypes = ['log', 'success', 'error'];
  
// Create objects for miner and server messages using a loop
const miner_message = {};
const server_message = {};
const data_message = {};
  
for (const type of messageTypes) {
    miner_message[type] = (message) => {
        console.log(generateLogMessage('cyan', message, type === 'log' ? 'reset' : type));
    };
  
    server_message[type] = (message) => {
        console.log(generateLogMessage('magenta', message, type === 'log' ? 'reset' : type));
    };

    data_message[type] = (message) => {
        console.log(generateLogMessage('blue', message, type === 'log' ? 'reset' : type));
    };
}

module.exports = {
    processRootDirectory,
    mining_difficulty,
    miner_message,
    server_message,
    data_message
}