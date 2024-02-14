import { createInterface } from "readline";
import { Chalk, ChalkInstance } from "chalk";
import process from "process";
import ansiEscapes from "ansi-escapes";
import { existsSync, mkdirSync, createWriteStream } from "fs";
import { dirname } from "path";
//import { Writable } from "stream";

import { EventEmitter } from "events";
const events = new EventEmitter();

const processRootDirectory = process.cwd();

const mining_difficulty = 6;
const mining_pow = 5;

class LogMessage {
    private readonly prefix: string;
    private readonly color: string;
    constructor(prefix: string, color: string) {
        this.prefix = prefix;
        this.color = color;
    }
    private _log(message: string, type: string) {
        logToConsole(this.prefix, this.color, message, type);
    }
    public log(message: string) {this._log(message, "log");}
    public success(message: string) {this._log(message, "success");}
    public error(message: string) {this._log(message, "error");}
    public warn(message: string) {this._log(message, "warn");}
}

class LeiCoinNetLogMessage extends LogMessage {
    public readonly server: LogMessage = new LogMessage('LeiCoinNet-Server', '#f47fff');
    public readonly client: LogMessage = new LogMessage('LeiCoinNet-Client', '#f47fff');
    constructor(prefix: string, color: string) {
        super(prefix, color);
    }
}

const default_message = new LogMessage('Global', '#ffffff');
const miner_message = new LogMessage('Miner', '#00ffff');
const api_message = new LogMessage('API', '#c724b1');
const data_message = new LogMessage('Data', '#1711df');
const leicoin_net_message = new LeiCoinNetLogMessage('LeiCoinNet', '#f47fff')

const ctx = new Chalk({level: 3});

const message_styles: { [key: string]: ChalkInstance } = {
    reset: ctx.reset,
    success: ctx.green,
    error: ctx.red,
    warn: ctx.yellow,
};

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

function logToConsole(prefix: string, color: string, message: string, type = 'log') {
    
    function generateStyledMessage(prefix: string, color: string, message: string, type = 'log') {
        const colorizedPrefix = ctx.hex(color).visible(`[${prefix}]`);
        const styleFunction = message_styles[type] || message_styles.reset;
        const styledMessage = styleFunction(message);
        return `${colorizedPrefix} ${styledMessage}`;
    }

    const styledMessage = generateStyledMessage(prefix, color, message, type);

    const currentPromptInput = rl.line;

    // Clear the current line and move the cursor to the beginning
    process.stdout.write(ansiEscapes.eraseLines(1)); // Clear the current line
    process.stdout.write(ansiEscapes.cursorTo(0)); // Move the cursor to the beginning

    console.log(styledMessage);
    logStream.write(`[${prefix}] ${message}\n`);

    rl.prompt();
    rl.write(null, { ctrl: true, name: 'e' });

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


function gracefulShutdown(exitCode: number = 0) {
    default_message.log('Shutting down...');

    events.emit("stop_server");

    default_message.log('LeiCoin Node stopped.');
    process.exit(exitCode);
  
}
  

rl.on('line', (input) => {
    handleCommand(input.trim().toLowerCase());
    rl.prompt();
}).on('close', () => {
    //default_message.log('CLI closed.');
});

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);


// Define a generic interface representing the class structure
interface Constructable<T> {
    new (...args: any[]): T;
}
  
// Define a function to create an instance of a class from a JSON object
function createInstanceFromJSON<T>(cls: Constructable<T>, json: any): T {
    // Retrieve the constructor of the class
    const constructor = cls as any;
  
    // Retrieve the parameter names of the constructor
    const paramNames = constructor.toString().match(/\(([^)]+)\)/)?.[1].split(',').map((param: string) => param.trim()) || [];
  
    // Create an array of arguments for the constructor
    const args = paramNames.map((paramName: string) => json[paramName]);
  
    // Instantiate the class with the arguments
    const instance = Reflect.construct(cls, args);
  
    // Return the instance
    return instance;
}


export default {
    processRootDirectory,
    mining_difficulty,
    mining_pow,
    miner_message,
    api_message,
    leicoin_net_message,
    data_message,
    events,
    createInstanceFromJSON,
    gracefulShutdown
};