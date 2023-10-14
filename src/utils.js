const process = require('process');
const chalk = require('chalk');

const processRootDirectory = process.cwd();
const mining_difficulty = 6;

const miner_message = {};
const server_message = {};
const data_message = {};

function generateLogMessage(prefix, message, style = 'reset') {
    const styles = {
        reset: chalk.reset,
        green: chalk.green,
        red: chalk.red,
    };

    if (styles[style]) {
        return `${chalk[style](`${prefix}`)} ${styles[style](message)}`;
    } else {
        return `${chalk[prefix]} ${chalk.reset(message)}`;
    }
}

function logMessageWithPrefix(prefix, ...messages) {
    const message = messages.join(' ');
    console.log(generateLogMessage(prefix, message));
}

const messageTypes = ['log', 'success', 'error'];

const messageConfigs = [
    { object: miner_message, prefix: chalk.cyan('[Miner]') },
    { object: server_message, prefix: chalk.magenta('[Server]') },
    { object: data_message, prefix: chalk.blue('[Data]') },
];

for (const type of messageTypes) {
    for (const { object, prefix } of messageConfigs) {
        object[type] = (...messages) => {
            logMessageWithPrefix(prefix, ...messages);
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