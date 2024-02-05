import { createInterface } from 'readline';
import { Chalk, ChalkInstance } from 'chalk';
import { cwd, stdin, stdout, exit, on } from 'process';
import ansiEscapes from 'ansi-escapes';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { dirname } from 'path';
//const { Writable } = require('stream');

import { EventEmitter } from "events";
const events = new EventEmitter();

const processRootDirectory = cwd();

const mining_difficulty = 6;
const mining_pow = 5;

interface LogMessageObject {
    [key: string]: (message: string) => void;
}


const default_message: LogMessageObject = {};
const miner_message: LogMessageObject = {};
const server_message: LogMessageObject = {};
const data_message: LogMessageObject = {};
const ws_client_message: LogMessageObject = {};

const ctx = new Chalk({level: 3});

const message_styles: { [key: string]: ChalkInstance } = {
    reset: ctx.reset,
    success: ctx.green,
    error: ctx.red,
    warn: ctx.yellow,
};


const messageTypes = ['log', 'success', 'error', 'warn'];

const messageConfigs: { object: { [key: string]: (message: string) => void }, prefix: string, color: string }[] = [
    { object: default_message, prefix: 'Global', color: '#ffffff' },
    { object: miner_message, prefix: 'Miner', color: '#00ffff' },
    { object: server_message, prefix: 'Server', color: '#c724b1' },
    { object: data_message, prefix: 'Data', color: '#1711df' },
    { object: ws_client_message, prefix: 'WS Client', color: '#f47fff' },
];

const rl = createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
});

function generateLogMessage(prefix: string, message: string, color: string, type = 'log') {
    const colorizedPrefix = ctx.hex(color).visible(`[${prefix}]`);
    const styleFunction = message_styles[type] || message_styles.reset;
    const styledMessage = styleFunction(message);
    return `${colorizedPrefix} ${styledMessage}`;
}

function logToConsole(prefix: string, message: string, type = 'log') {
    const config = messageConfigs.find((config) => config.prefix === prefix);
    let color;
    if (!config) {
        return;
    }
    color = config.color;

    const outputMessage = generateLogMessage(prefix, message, color, type);

    // Clear the current line and move the cursor to the beginning
    stdout.write(ansiEscapes.eraseLines(1)); // Clear the current line
    stdout.write(ansiEscapes.cursorTo(0)); // Move the cursor to the beginning
    console.log(outputMessage);

    logStream.write(`[${prefix}] ${message}\n`);

    rl.prompt();
}


for (const { object, prefix } of messageConfigs) {
    for (const type of messageTypes) {
        object[type] = (message: string) => {
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

const logFilePathdir = dirname(logFilePath);
if (!existsSync(logFilePathdir)) {
    mkdirSync(logFilePathdir, { recursive: true });
    //logToConsole(`Directory ${logFilePathdir} was created because it was missing.`);
}

const logStream = createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });
logStream.on('error', (err) => {
    //data_message.warn('Error writing to log file:', err);
});

function handleCommand(command: string) {
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
    exit(0);
  
}
  

rl.on('line', (input) => {
    handleCommand(input.trim().toLowerCase());
    rl.prompt();
}).on('close', () => {
    //default_message.log('CLI closed.');
    exit(0);
});

on("SIGINT", gracefulShutdown);
on("SIGTERM", gracefulShutdown);

export {
    processRootDirectory,
    mining_difficulty,
    mining_pow,
    miner_message,
    server_message,
    ws_client_message,
    data_message,
    events,
};
