import { createInterface } from "readline";
import type { ChalkInstance } from "chalk";
import process from "process";
import fs from "fs";
import { dirname } from "path";
import utils from "./index.js";
import { Dict } from "../objects/dictonary.js";

interface LogMessageLike {
    info(message: string): void;
    success(message: string): void;
    error(message: string): void;
    warn(message: string): void;
}

interface LeiCoinNetLogMessageLike {
    server: LogMessageLike;
    client: LogMessageLike;
}

export interface CLILike {
    default_message: LogMessageLike;
    staker_message: LogMessageLike;
    api_message: LogMessageLike;
    data_message: LogMessageLike;
    leicoin_net_message: LeiCoinNetLogMessageLike;
    setup(): Promise<void>;
    close(): Promise<any>;
}

class CLI {

    private static instance: CLI;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
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
        public info(message: string) {this._log(message, "info");}
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

    public readonly default_message: LogMessageLike = new CLI.LogMessage('Global', '#ffffff');
    public readonly staker_message: LogMessageLike = new CLI.LogMessage('Staker', '#00ffff');
    public readonly api_message: LogMessageLike = new CLI.LogMessage('API', '#c724b1');
    public readonly data_message: LogMessageLike = new CLI.LogMessage('Data', '#1711df');
    public readonly leicoin_net_message: LeiCoinNetLogMessageLike = new CLI.LeiCoinNetLogMessage('LeiCoinNet', '#f47fff');

    private ctx: ChalkInstance | null = null;

    private readonly message_styles: Dict<ChalkInstance> = {};

    private ansiEscapes: any = null;

    public async setup() {
        if (!this.ctx) {
            this.ctx = new (await import("chalk")).Chalk({level: 3});
            this.message_styles.reset = this.ctx.reset;
            this.message_styles.success = this.ctx.green;
            this.message_styles.error = this.ctx.red;
            this.message_styles.warn = this.ctx.yellow;
        }
        if (!this.ansiEscapes) {
            this.ansiEscapes = (await import("ansi-escapes")).default;
        }
    }

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
            this.rl.prompt();
            this.rl.write(null, { ctrl: true, name: 'e' });
        });

        this.rl.on('line', (input) => {
            this.handleCommand(input.trim().toLowerCase());
            this.rl.prompt();
        }).on('close', () => {
            //default_message.log('CLI closed.');
        });
    }

    private logToConsole(prefix: string, color: string, message: string, type = 'info') {
    
        const colorizedPrefix = this.ctx?.hex(color).visible(`[${prefix}]`);
        const styleFunction = this.message_styles[type] || this.message_styles.reset;
        const styledMessage = `${colorizedPrefix} ${styleFunction(message)}`;
    
        // Clear the current line and move the cursor to the beginning
        process.stdout.write(this.ansiEscapes.eraseLines(1)); // Clear the current line
        process.stdout.write(this.ansiEscapes.cursorTo(0)); // Move the cursor to the beginning
    
        console.log(styledMessage);
        this.logStream.write(`[${prefix}] ${message}\n`);
    
        this.rl.prompt();
        this.rl.write(null, { ctrl: true, name: 'e' });
    }

    private handleCommand(command: string) {
        switch (command) {
            case 'help':
                this.default_message.info('Available commands:');
                this.default_message.info(' - help: Show available commands');
                this.default_message.info(' - stop: Stops The Server and Staker');
                break;
            case 'stop':
                utils.gracefulShutdown();
                break;
            default:
                this.default_message.info('Command not recognized. Type "help" for available commands.');
                break;
        }
    }

    public async close(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.rl.setPrompt("");
            this.rl.prompt();
            this.rl.close();
            this.logStream.on('finish', () => {
              this.logStream.close();
              resolve(null);
            });
        
            this.logStream.on('error', (error) => {
              reject(error);
            });
            this.logStream.end();
        });
    }
 
}

class NoCLI implements CLILike {

    private static instance: NoCLI;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }
    
    private static LogMessage = class {
        private readonly prefix: string;
        constructor(prefix: string) {
            this.prefix = prefix;
        }
        private _log(message: string, type: string) {
            const styledMessage = `[${type.toUpperCase()}]: [${this.prefix}] ${message}`;
            console.log(styledMessage);
        }
        public info(message: string) {this._log(message, "info");}
        public success(message: string) {this._log(message, "success");}
        public error(message: string) {this._log(message, "error");}
        public warn(message: string) {this._log(message, "warn");}
    }
    
    private static LeiCoinNetLogMessage = class extends NoCLI.LogMessage {
        public readonly server = new NoCLI.LogMessage('LeiCoinNet-Server');
        public readonly client = new NoCLI.LogMessage('LeiCoinNet-Client');
        constructor(prefix: string) {
            super(prefix);
        }
    }

    public readonly default_message: LogMessageLike = new NoCLI.LogMessage('Global');
    public readonly staker_message: LogMessageLike = new NoCLI.LogMessage('Staker');
    public readonly api_message: LogMessageLike = new NoCLI.LogMessage('API');
    public readonly data_message: LogMessageLike = new NoCLI.LogMessage('Data');
    public readonly leicoin_net_message: LeiCoinNetLogMessageLike = new NoCLI.LeiCoinNetLogMessage('LeiCoinNet');

    public async setup() { return; }
    public async close() { return; }

}

let cli: CLILike;
if (process.env.nocli === "true") {
    cli = NoCLI.getInstance();
} else {
    cli = CLI.getInstance();
}

export default cli;
