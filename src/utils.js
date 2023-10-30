const readline = require('readline');
const chalk = require('chalk');
const process = require('process');
const ansiEscapes = require('ansi-escapes');
const fs = require('fs');
const path = require('path');
//const { Writable } = require('stream');

const { EventEmitter } = require("events");
const events = new EventEmitter();

const processRootDirectory = process.cwd();

const mining_difficulty = 6;
const mining_pow = 5;


const default_message = {};
const miner_message = {};
const server_message = {};
const data_message = {};
const ws_client_message = {};

const ctx = new chalk.Instance({level: 3});

const styles = {
    reset: ctx.reset,
    success: ctx.green,
    error: ctx.red,
};


const messageTypes = ['log', 'success', 'error'];

const messageConfigs = [
    { object: default_message, prefix: '', color: '#ffffff' },
    { object: miner_message, prefix: 'Miner', color: '#00ffff' },
    { object: server_message, prefix: 'Server', color: '#c724b1' },
    { object: data_message, prefix: 'Data', color: '#1711df' },
    { object: ws_client_message, prefix: 'WS Client', color: '#f47fff' },
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

function generateLogMessage(prefix, message, color, type = 'log') {
    const colorizedPrefix = ctx.hex(color).visible(`[${prefix}]`);
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

    logStream.write(message + '\n');

    rl.prompt();
}


for (const { object, prefix } of messageConfigs) {
    for (const type of messageTypes) {
        object[type] = (message) => {
            logToConsole(prefix, message, type);
        };
    }
}

// Function to get the current date and time as a formatted string
function getCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
}

// Generate a timestamp for the log file name
const timestamp = getCurrentTimestamp();
const logFilePath = processRootDirectory + `/logs/log-${timestamp}.log`;

const logFilePathdir = path.dirname(logFilePath);
if (!fs.existsSync(logFilePathdir)) {
    fs.mkdirSync(logFilePathdir, { recursive: true });
    data_message.log(`Directory ${logFilePathdir} was created because it was missing.`);
}
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, "", 'utf8');
    data_message.log(`File ${logFilePath} was created because it was missing.`);
}

const logStream = fs.createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });
logStream.on('error', (err) => {
    console.error('Error writing to log file:', err);
});

function handleCommand(command) {
    switch (command) {
        case 'help':
            default_message.log('Available commands:');
            default_message.log(' - help: Show available commands');
            default_message.log(' - stop: Stops The Server and Miner');
            break;
        case 'stop':
            gracefulShutdown();
            break;
        default:
            default_message.log('Command not recognized. Type "help" for available commands.');
            break;
    }
}


function gracefulShutdown() {
    default_message.log('Shutting down...');

    events.emit("stop_server");

    default_message.log('LeiCoin Node stopped.');
    process.exit(0);
  
}
  

rl.on('line', (input) => {
    handleCommand(input.trim().toLowerCase());
    rl.prompt();
}).on('close', () => {
    //default_message.log('CLI closed.');
    process.exit(0);
});

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = {
    processRootDirectory,
    mining_difficulty,
    mining_pow,
    miner_message,
    server_message,
    ws_client_message,
    data_message,
    events,
};
