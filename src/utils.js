const process = require('process');
const chalk = require('chalk');

const processRootDirectory = process.cwd();
const mining_difficulty = 6;

const miner_message = {};
const server_message = {};
const data_message = {};

const styles = {
    reset: chalk.reset,
    success: chalk.green,
    error: chalk.red,
};

const messageTypes = ['log', 'success', 'error'];

const messageConfigs = [
    { object: miner_message, prefix: 'Miner', color: 'cyan' },
    { object: server_message, prefix: 'Server', color: 'magenta' },
    { object: data_message, prefix: 'Data', color: 'blue' },
];

function generateLogMessage(prefix, message, color, type = 'log') {
    const colorizedPrefix = chalk[color](`[${prefix}]`);
    const styleFunction = styles[type] || styles.reset;
    const styledMessage = styleFunction(message);
    return `${colorizedPrefix} ${styledMessage}`;
}

for (const { object, prefix, color } of messageConfigs) {
    for (const type of messageTypes) {
        object[type] = (message) => {
            console.log(generateLogMessage(prefix, message, color, type));
        };
    }
}

module.exports = {
    processRootDirectory,
    mining_difficulty,
    miner_message,
    server_message,
    data_message
}