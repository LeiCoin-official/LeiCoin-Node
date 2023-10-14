const process = require('process');
const chalk = require('chalk');

const processRootDirectory = process.cwd();
const mining_difficulty = 6;

function sendMinerLogMessage(message) {
    console.log(chalk.cyan('[Miner] ') + chalk.reset(message));
};

function sendServerLogMessage(message) {
    console.log(chalk.magenta('[Server] ') + chalk.reset(message));
};


module.exports = {
    processRootDirectory,
    mining_difficulty,
    sendMinerLogMessage,
    sendServerLogMessage
}