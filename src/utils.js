const readline = require('readline');
const chalk = require('chalk');
const process = require('process');
const ansiEscapes = require('ansi-escapes');

const processRootDirectory = process.cwd();
const mining_difficulty = 6;

const miner_message = {};
const api_message = {};
const data_message = {};
const ws_message = {};

const styles = {
    reset: chalk.reset,
    success: chalk.green,
    error: chalk.red,
};

const messageTypes = ['log', 'success', 'error'];

const messageConfigs = [
    { object: miner_message, prefix: 'Miner', color: '#00ffff' },
    { object: api_message, prefix: 'API', color: '#c724b1' },
    { object: data_message, prefix: 'Data', color: '#1711df' },
    { object: ws_message, prefix: 'WebSocket', color: '#f47fff' },
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

function generateLogMessage(prefix, message, color, type = 'log') {
    const colorizedPrefix = chalk.hex(color).visible(`[${prefix}]`);
    const styleFunction = styles[type] || styles.reset;
    const styledMessage = styleFunction(message);
    return `${colorizedPrefix} ${styledMessage}`;
}

function logToConsole(prefix, message, type = 'log') {
    const color = messageConfigs.find((config) => config.prefix === prefix).color;
    const outputMessage = generateLogMessage(prefix, message, color, type);

    // Clear the current line and move the cursor to the beginning
    process.stdout.write(ansiEscapes.eraseLines(1)); // Clear the current line
    process.stdout.write(ansiEscapes.cursorTo(0)); // Move the cursor to the beginning
    console.log(outputMessage);

    rl.prompt();
}


for (const { object, prefix } of messageConfigs) {
    for (const type of messageTypes) {
        object[type] = (message) => {
            logToConsole(prefix, message, type);
        };
    }
}

function handleCommand(command) {
    switch (command) {
      case 'help':
        console.log('Available commands:');
        console.log(' - help: Show available commands');
        console.log(' - stop: Stops The Server and Miner');
        break;
      case 'stop':
        process.exit(0);
        break;
      default:
        console.log('Command not recognized. Type "help" for available commands.');
        break;
    }
}

rl.on('line', (input) => {
    handleCommand(input.trim().toLowerCase());
    rl.prompt();
}).on('close', () => {
    console.log('CLI closed.');
    process.exit(0);
});

module.exports = {
    processRootDirectory,
    mining_difficulty,
    miner_message,
    api_message,
    ws_message,
    data_message,
};
