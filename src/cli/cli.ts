import { createInterface, Interface as ReadlineInterface } from "readline";
import type { Chalk } from "chalk";
import fs from "fs";
import { dirname as path_dirname } from "path";
import { Dict } from "../utils/dataUtils.js";
import { DataUtils } from "../utils/dataUtils.js";
import CLICMDHandler from "./cliCMDHandler.js";

class Logger {

    constructor(
        private readonly prefix: string,
        private readonly color: string,
        private readonly logger: (message: string, type: LogType, prefix: string, prefixColor: string) => void
    ) {}

    public info(message: string) { this.logger.call(CLI.getInstance(), message, "info", this.prefix, this.color) }
    public success(message: string) { this.logger.call(CLI.getInstance(), message, "success", this.prefix, this.color) }
    public error(message: string) { this.logger.call(CLI.getInstance(), message, "error", this.prefix, this.color) }
    public warn(message: string) { this.logger.call(CLI.getInstance(), message, "warn", this.prefix, this.color) }
}

type LogType = "info" | "success" | "error" | "warn";
type LogLevel = "none" | "cmd" | "error" | "warns" | "all";

type AllowedLogLevelConfig = {
    [key in LogType]: boolean
}

type AllowedLogLevelConfigs = {
    console: AllowedLogLevelConfig;
    file: AllowedLogLevelConfig;
}

class CLIUtils {

    public static async setLogLevelConfig(logLevel: LogLevel, config: AllowedLogLevelConfig) {
        switch (logLevel) {
            case "none":
            case "cmd": {
                config.info = config.success = config.error = config.warn = false;
                break;
            }
            case "error": {
                config.info = config.success = config.warn = false;
                config.error = true;
                break;
            }
            case "warns": {
                config.info = config.success = false;
                config.error = config.warn = true;
                break;
            }
            case "all": {
                config.info = config.success = config.error = config.warn = true;
                break;
            }
        }
    }

}

class CLI {

    private static instance: CLI;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CLI();
        }
        return this.instance;
    }

    private constructor() {}
    
    private logLevel: LogLevel = "all";
    private logFileLevel: LogLevel = "none";
    private colorized: boolean = false;
    private interactiveCLI: boolean = false;

    private allowdLogs: AllowedLogLevelConfigs = {
        console: { info: true, success: true, error: true, warn: true },
        file: { info: true, success: true, error: true, warn: true }
    }

    readonly default = new Logger('Global', '#ffffff', this.log);
    readonly pos = new Logger('POS', '#0000ff', this.log);
    readonly minter = new Logger('MinterClient', '#00ffff', this.log);
    readonly api = new Logger('API', '#c724b1', this.log);
    readonly data = new Logger('Data', '#1711df', this.log);
    readonly cmd = new Logger('CLI', '#ffffff', this.log);
    readonly leicoin_net = new Logger('LeiCoinNet', '#f47fff', this.log);

    private ctx: Chalk | null = null;
    private messageStyles: Dict<Chalk> = {};
    private ansiEscapes: any = null;
    private rl: ReadlineInterface | null = null;
    private logStream: fs.WriteStream | null = null;
    private cmdHandler: CLICMDHandler | null = null;

    public async init(
        logLevel: LogLevel,
        logFileLevel: Exclude<LogLevel, "cmd">,
        colorized: boolean,
        interactiveCLI: boolean,
        cwd: string
    ) {
        this.logLevel = logLevel;
        this.logFileLevel = logFileLevel;
        this.colorized = colorized;
        this.interactiveCLI = interactiveCLI;

        await CLIUtils.setLogLevelConfig(this.logLevel, this.allowdLogs.console);
        await CLIUtils.setLogLevelConfig(this.logFileLevel, this.allowdLogs.file);

        if (this.logFileLevel !== "none") {
            this.startLogStream(cwd);
        }
        if (this.interactiveCLI) {
            await this.setupCLI();
        }
        if (this.colorized) {
            await this.setupCTX();
        }
    }

    private log(message: string, type: LogType, prefix: string, prefixColor: string) {
        if (this.allowdLogs.console[type]) {
            this.logToConsole(message, type, prefix, prefixColor);
        } else if (this.logLevel === "cmd" && prefix === "CLI") {
            console.log(`[${type.toUpperCase()}]: ${message}`);
            return;
        }
        if (this.allowdLogs.file[type]) {
            this.logToFile(message, type, prefix);
        }
    }

    private logToConsole(message: string, type: LogType, prefix: string, prefixColor: string) {
        const styledMessage = this.colorized ?
            this.getColorizedMessage(message, type, prefix, prefixColor) :
            this.getUnColorizedMessage(message, type, prefix);

        if (this.interactiveCLI) {
            // Clear the current line and move the cursor to the beginning
            process.stdout.write(this.ansiEscapes.eraseLines(1)); // Clear the current line
            process.stdout.write(this.ansiEscapes.cursorTo(0)); // Move the cursor to the beginning
        }
        console.log(styledMessage);
        if (this.interactiveCLI) {
            this.rl?.prompt(true);
            //this.rl.write(null, { ctrl: true, name: 'e' }); // Move the cursor to the end
        }
    }

    private logToFile(message: string, type: LogType, prefix: string) {
        this.logStream?.write(`${this.getUnColorizedMessage(message, type, prefix)}\n`);
    }

    private getColorizedMessage(message: string, type: LogType, prefix: string, prefixColor: string) {
        const colorizedPrefix = this.ctx?.hex(prefixColor).visible(`[${prefix}]`);
        const styleFunction = this.messageStyles[type] || this.messageStyles.reset;
        const styledMessage = `${colorizedPrefix} ${styleFunction(message)}`;
        return styledMessage;
    }
    private getUnColorizedMessage(message: string, type: LogType, prefix: string) {
        return `[${type.toUpperCase()}]: [${prefix}] ${message}`;
    }

    private async setupCTX() {
        if (!this.ctx) {
            this.ctx = new (await import("chalk")).default.Instance({level: 3});
            this.messageStyles.reset = this.ctx.reset;
            this.messageStyles.success = this.ctx.green;
            this.messageStyles.error = this.ctx.red;
            this.messageStyles.warn = this.ctx.yellow;
        }
    }

    private startLogStream(cwd: string) {
        const logFilePath = cwd + `/logs/log-${DataUtils.getCurrentLogTime()}.log`;

        const logFilePathdir = path_dirname(logFilePath);
        if (!fs.existsSync(logFilePathdir)) {
            fs.mkdirSync(logFilePathdir, { recursive: true });
            //logToConsole(`Directory ${logFilePathdir} was created because it was missing.`);
        }

        this.logStream = fs.createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });
        this.logStream.on('error', (err) => {
            console.error(`[System] Error writing to log: ${err.stack}`);
            if (this.interactiveCLI) this.rl?.prompt();
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
        if (!this.logStream) return;
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

const cli = CLI.getInstance();
export default cli;
