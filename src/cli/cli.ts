import { createInterface, Interface as ReadlineInterface } from "readline";
import type { Chalk } from "chalk";
import fs from "fs";
import { dirname as path_dirname } from "path";
import utils from "../utils/index.js";
import { Dict } from "../utils/dataUtils.js";
import { DataUtils } from "../utils/dataUtils.js";
import CLICMDHandler from "./cliCMDHandler.js";
import ansiEscapes from "ansi-escapes";

class Logger {
    public info = (message: string, prefix: string, prefixColor: string) => {}
    public success = (message: string, prefix: string, color: string) => {}
    public error = (message: string, prefix: string, color: string) => {}
    public warn = (message: string, prefix: string, color: string) => {}
}

class SubLogger {

    constructor(
        private readonly prefix: string,
        private readonly color: string,
        private readonly logger: Logger
    ) {}

    public info(message: string) { this.logger.info(message, this.prefix, this.color) }
    public success(message: string) { this.logger.success(message, this.prefix, this.color) }
    public error(message: string) { this.logger.error(message, this.prefix, this.color) }
    public warn(message: string) { this.logger.warn(message, this.prefix, this.color) }
}

export interface CLILike {
    default: Logger;
    minter: Logger;
    api: Logger;
    data: Logger;
    cmd: Logger;
    leicoin_net: Logger;
    setup(): Promise<void>;
    close(): Promise<any>;
}

class InteractiveCLI implements CLILike {

    private static instance: InteractiveCLI;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new InteractiveCLI();
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
            InteractiveCLI.getInstance().logToConsole(this.prefix, this.color, message, type);
        }
        public info(message: string) {this._log(message, "info");}
        public success(message: string) {this._log(message, "success");}
        public error(message: string) {this._log(message, "error");}
        public warn(message: string) {this._log(message, "warn");}
    }

    readonly default = new InteractiveCLI.LogMessage('Global', '#ffffff');
    readonly minter = new InteractiveCLI.LogMessage('MinterClient', '#00ffff');
    readonly api = new InteractiveCLI.LogMessage('API', '#c724b1');
    readonly data = new InteractiveCLI.LogMessage('Data', '#1711df');
    readonly cmd = new InteractiveCLI.LogMessage('CLI', '#ffffff');
    readonly leicoin_net = new InteractiveCLI.LogMessage('LeiCoinNet', '#f47fff');

    private ctx: Chalk | null = null;

    private readonly message_styles: Dict<Chalk> = {};

    private ansiEscapes: any = null;

    public async setup() {
        if (!this.ctx) {
            this.ctx = new (await import("chalk")).default.Instance({level: 3});
            this.message_styles.reset = this.ctx.reset;
            this.message_styles.success = this.ctx.green;
            this.message_styles.error = this.ctx.red;
            this.message_styles.warn = this.ctx.yellow;
        }
        if (!this.ansiEscapes) {
            this.ansiEscapes = (await import("ansi-escapes")).default;
        }
        if (!this.cmdHandler) {
            this.cmdHandler = (await import("./cliCMDHandler.js")).default.getInstance();
        }
    }

    private readonly rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    private logStream: fs.WriteStream;

    private cmdHandler: CLICMDHandler | null = null;

    private constructor() {
        // Generate a timestamp for the log file name
        const current_time = DataUtils.getCurrentLogTime();
        const logFilePath = utils.procCWD + `/logs/log-${current_time}.log`;

        const logFilePathdir = path_dirname(logFilePath);
        if (!fs.existsSync(logFilePathdir)) {
            fs.mkdirSync(logFilePathdir, { recursive: true });
            //logToConsole(`Directory ${logFilePathdir} was created because it was missing.`);
        }

        this.logStream = fs.createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });
        this.logStream.on('error', (err) => {
            console.error(`[System] Error writing to log: ${err.stack}`);
            this.rl.prompt();
            this.rl.write(null, { ctrl: true, name: 'e' });
        });

        this.rl.on('line', (input) => {
            //this.handleCommand(input.trim().toLowerCase());
            this.cmdHandler?.handle(input);
            this.rl.prompt();
        }).on('SIGINT', () => {
            //this.default_message.info(`Command not recognized. Type "help" for available commands.`);

            process.stdout.write(this.ansiEscapes.eraseLines(1)); // Clear the current line
            process.stdout.write(this.ansiEscapes.cursorTo(0)); // Move the cursor to the beginning

            console.log(`> ${this.rl.line}^C`);
            this.rl.prompt(true);
            this.rl.write(null, { ctrl: true, name: 'e' }); this.rl.write(null, { ctrl: true, name: 'u' }); // Clear the current line

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
    
        this.rl.prompt(true);
        //this.rl.write(null, { ctrl: true, name: 'e' }); // Move the cursor to the end
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
            this.instance = new NoCLI();
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

    readonly default = new NoCLI.LogMessage('Global');
    readonly minter = new NoCLI.LogMessage('MinterClient');
    readonly api = new NoCLI.LogMessage('API');
    readonly data = new NoCLI.LogMessage('Data');
    readonly cmd = new NoCLI.LogMessage('CLI');
    readonly leicoin_net = new NoCLI.LogMessage('LeiCoinNet');

    public async setup() { return; }
    public async close() { return; }

}

class OnlyCommandOutput implements CLILike {

    private static instance: OnlyCommandOutput;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new OnlyCommandOutput();
        }
        return this.instance;
    }

    private static NoOutput = new class {
        info(message: string) {}
        success(message: string) {}
        error(message: string) {}
        warn(message: string) {}
    }

    readonly default = OnlyCommandOutput.NoOutput;
    readonly minter = OnlyCommandOutput.NoOutput;
    readonly api = OnlyCommandOutput.NoOutput;
    readonly data = OnlyCommandOutput.NoOutput;
    readonly leicoin_net = OnlyCommandOutput.NoOutput;

    readonly cmd = new class {
        private _log(message: string, type: string) {
            const styledMessage = `${message}`;
            console.log(styledMessage);
        }
        public info(message: string) {this._log(message, "info");}
        public success(message: string) {this._log(message, "success");}
        public error(message: string) {this._log(message, "error");}
        public warn(message: string) {this._log(message, "warn");}
    };

    public async setup() { return; }
    public async close() { return; }

}

type LogType = "info" | "success" | "error" | "warn";
type LogLevel = "none" | "error" | "warns" | "all";


class CLI implements CLILike {

    private static instance: CLI;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CLI();
        }
        return this.instance;
    }

    private constructor() {}
    
    private logLevel: LogLevel = "all";
    private logFileLevel: LogLevel = "all";
    private colorized: boolean = true;
    private cli: boolean = true;

    private readonly logger = new Logger();

    readonly default = new SubLogger('Global', '#ffffff', this.logger);
    readonly minter = new SubLogger('MinterClient', '#00ffff', this.logger);
    readonly api = new SubLogger('API', '#c724b1', this.logger);
    readonly data = new SubLogger('Data', '#1711df', this.logger);
    readonly cmd = new SubLogger('CLI', '#ffffff', this.logger);
    readonly leicoin_net = new SubLogger('LeiCoinNet', '#f47fff', this.logger);

    private ctx: Chalk | null = null;
    private message_styles: Dict<Chalk> = {};
    private ansiEscapes: any = null;
    private rl: ReadlineInterface | null = null;
    private logStream: fs.WriteStream | null = null;
    private cmdHandler: CLICMDHandler | null = null;

    public async setCLI(
        logLevel: LogLevel,
        logFileLevel: LogLevel,
        colorized: boolean,
        cli: boolean
    ) {
        this.logLevel = logLevel;
        this.logFileLevel = logFileLevel;
        this.colorized = colorized;
        this.cli = cli;



        if (this.cli) {
            await this.setupCLI();
        } else {

        }

        if (colorized) {
            await this.setupCTX();
            this.getStyledMessage = this.getColorizedMessage;
        } else {
            this.getStyledMessage = this.getUnColorizedMessage;
        }
    }

    private log() {
        //const message = this.getMessage();
    }

    private logToConsole(prefix: string, prefixColor: string, message: string, type: LogType) {
        const styledMessage = this.getStyledMessage(message, type, prefix, prefixColor);

        if (this.cli) {
            // Clear the current line and move the cursor to the beginning
            process.stdout.write(this.ansiEscapes.eraseLines(1)); // Clear the current line
            process.stdout.write(this.ansiEscapes.cursorTo(0)); // Move the cursor to the beginning
        }
    
        console.log(styledMessage);
        
        if (this.cli) {
            this.rl?.prompt(true);
            //this.rl.write(null, { ctrl: true, name: 'e' }); // Move the cursor to the end
        }
    }

    private logToFile(message: string, type: LogType, prefix: string) {
        this.logStream?.write(`${this.getUnColorizedMessage(message, type, prefix, null)}\n`);
    }

    private getStyledMessage = this.getColorizedMessage;

    private getColorizedMessage(message: string, type: LogType, prefix: string, prefixColor: string) {
        const colorizedPrefix = this.ctx?.hex(prefixColor).visible(`[${prefix}]`);
        const styleFunction = this.message_styles[type] || this.message_styles.reset;
        const styledMessage = `${colorizedPrefix} ${styleFunction(message)}`;
        return styledMessage;
    }
    private getUnColorizedMessage(message: string, type: LogType, prefix: string, prefixColor: any) {
        return `[${type.toUpperCase()}]: [${prefix}] ${message}`;
    }

    private async setupCTX() {
        if (!this.ctx) {
            this.ctx = new (await import("chalk")).default.Instance({level: 3});
            this.message_styles.reset = this.ctx.reset;
            this.message_styles.success = this.ctx.green;
            this.message_styles.error = this.ctx.red;
            this.message_styles.warn = this.ctx.yellow;
        }
    }

    private startLogstream(cwd: string) {
        const logFilePath = cwd + `/logs/log-${DataUtils.getCurrentLogTime()}.log`;

        const logFilePathdir = path_dirname(logFilePath);
        if (!fs.existsSync(logFilePathdir)) {
            fs.mkdirSync(logFilePathdir, { recursive: true });
            //logToConsole(`Directory ${logFilePathdir} was created because it was missing.`);
        }

        this.logStream = fs.createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });
        this.logStream.on('error', (err) => {
            console.error(`[System] Error writing to log: ${err.stack}`);
            this.rl?.prompt(true);
        });
    }

    private async setupCLI() {

        if (!this.ansiEscapes) {
            this.ansiEscapes = (await import("ansi-escapes")).default;
        }
        if (!this.cmdHandler) {
            this.cmdHandler = (await import("./cliCMDHandler.js")).default.getInstance();
        }

        if (!this.rl) {
            this.rl = createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: true,
            });

            this.rl.on('line', (input) => {
                //this.handleCommand(input.trim().toLowerCase());
                this.cmdHandler?.handle(input);
                this.rl?.prompt();
            }).on('SIGINT', () => {
                //this.default_message.info(`Command not recognized. Type "help" for available commands.`);
    
                process.stdout.write(this.ansiEscapes.eraseLines(1)); // Clear the current line
                process.stdout.write(this.ansiEscapes.cursorTo(0)); // Move the cursor to the beginning
    
                console.log(`> ${this.rl?.line}^C`);
                this.rl?.prompt(true);
                this.rl?.write(null, { ctrl: true, name: 'e' }); this.rl?.write(null, { ctrl: true, name: 'u' }); // Clear the current line
    
            }).on('close', () => {
                //default_message.log('CLI closed.');
            });
        }

    }

    private async closeLogStream() {
        if (!this.logStream) {
            return;
        }
        return new Promise<null | Error>((resolve, reject) => {
            this.logStream?.on('finish', () => {
                this.logStream?.close();
                resolve(null);
            });
            
            this.logStream?.on('error', (error) => {
              reject(error);
            });
            this.logStream?.end();
        });
    }
 
    private async closeCLI() {
        if (!this.rl) return;
        this.rl.setPrompt("");
        this.rl.prompt();
        this.rl.close();
    }

    public async close() {
        await Promise.all([
            this.closeLogStream(),
            this.closeCLI()
        ]);
    }
 
}

let cli: CLILike;
if (process.env.NO_CLI === "true") {
    //cli = NoCLI.getInstance();
    cli = InteractiveCLI.getInstance();
} else if (process.env.NO_OUTPUT === "true") {
    cli = OnlyCommandOutput.getInstance();
} else {
    cli = InteractiveCLI.getInstance();
}

export default cli;
