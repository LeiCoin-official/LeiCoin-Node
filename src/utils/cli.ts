import { createInterface } from "readline";
import { Chalk, ChalkInstance } from "chalk";
import process from "process";
import ansiEscapes from "ansi-escapes";
import fs from "fs";
import { dirname } from "path";
import utils from "./utils.js";

export class CLI {

    private static instance: CLI | null = null;

    public static getInstance(): CLI {
        if (!CLI.instance) {
            CLI.instance = new CLI();
        }
        return CLI.instance;
    }
    
    private static LogMessage = class {
        private readonly prefix: string;
        private readonly color: string;
        constructor(prefix: string, color: string) {
            this.prefix = prefix;
            this.color = color;
        }
        private _log(message: string, type: string) {
            CLI.getInstance().logToConsole(this.prefix, this.color, message, type);
        }
        public log(message: string) {this._log(message, "log");}
        public success(message: string) {this._log(message, "success");}
        public error(message: string) {this._log(message, "error");}
        public warn(message: string) {this._log(message, "warn");}
    }
    
    private static LeiCoinNetLogMessage = class extends CLI.LogMessage {
        public readonly server = new CLI.LogMessage('LeiCoinNet-Server', '#f47fff');
        public readonly client = new CLI.LogMessage('LeiCoinNet-Client', '#f47fff');
        constructor(prefix: string, color: string) {
            super(prefix, color);
        }
    }

    public readonly default_message = new CLI.LogMessage('Global', '#ffffff');
    public readonly miner_message = new CLI.LogMessage('Miner', '#00ffff');
    public readonly api_message = new CLI.LogMessage('API', '#c724b1');
    public readonly data_message = new CLI.LogMessage('Data', '#1711df');
    public readonly leicoin_net_message = new CLI.LeiCoinNetLogMessage('LeiCoinNet', '#f47fff');

    private readonly ctx = new Chalk({level: 3});

    private readonly message_styles: { [key: string]: ChalkInstance } = {
        reset: this.ctx.reset,
        success: this.ctx.green,
        error: this.ctx.red,
        warn: this.ctx.yellow,
    };

    private readonly rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    private logStream: fs.WriteStream;

    private constructor() {
        // Generate a timestamp for the log file name
        const current_timestamp = utils.getCurrentTimestamp();
        const logFilePath = utils.processRootDirectory + `/logs/log-${current_timestamp}.log`;

        const logFilePathdir = dirname(logFilePath);
        if (!fs.existsSync(logFilePathdir)) {
            fs.mkdirSync(logFilePathdir, { recursive: true });
            //logToConsole(`Directory ${logFilePathdir} was created because it was missing.`);
        }

        this.logStream = fs.createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });
        this.logStream.on('error', (err) => {
            console.error(`[System] Error writing to log: ${err.message}`);
        });

        this.rl.on('line', (input) => {
            this.handleCommand(input.trim().toLowerCase());
            this.rl.prompt();
        }).on('close', () => {
            //default_message.log('CLI closed.');
        });
    }
    

    private logToConsole(prefix: string, color: string, message: string, type = 'log') {
    
        const colorizedPrefix = this.ctx.hex(color).visible(`[${prefix}]`);
        const styleFunction = this.message_styles[type] || this.message_styles.reset;
        const styledMessage = `${colorizedPrefix} ${styleFunction(message)}`;
    
        // Clear the current line and move the cursor to the beginning
        process.stdout.write(ansiEscapes.eraseLines(1)); // Clear the current line
        process.stdout.write(ansiEscapes.cursorTo(0)); // Move the cursor to the beginning
    
        console.log(styledMessage);
        this.logStream.write(`[${prefix}] ${message}\n`);
    
        this.rl.prompt();
        this.rl.write(null, { ctrl: true, name: 'e' });
    
    }

    private handleCommand(command: string) {
        switch (command) {
            case 'help':
                this.default_message.log('Available commands:');
                this.default_message.log(' - help: Show available commands');
                this.default_message.log(' - stop: Stops The Server and Miner');
                break;
            case 'stop':
                utils.gracefulShutdown();
                break;
            default:
                this.default_message.log('Command not recognized. Type "help" for available commands.');
                break;
        }
    }

}

const cli = CLI.getInstance();
export default cli;