import process from "process";
import { EventEmitter } from "events";
import type { CLILike } from "../cli/cli.js";

class Utils {

    private static instance: Utils;

    public static getInstance() {
        if (!Utils.instance) {
            Utils.instance = new Utils();
        }
        return Utils.instance;
    }

    private cli: CLILike | null = null;

    public readonly events = new EventEmitter();

    public readonly processRootDirectory = process.cwd();

    public readonly mining_difficulty = 6;
    public readonly mining_pow = 10;


    private constructor() {
        //process.on("SIGINT", this.gracefulShutdown);
        process.on("SIGTERM", this.gracefulShutdown);
    }

    private runStatus: "running" | "shutdown" | "shutdown_on_error" = "running";
    public getRunStatus() { return this.runStatus; }

    public async gracefulShutdown(exitCode: number = 0) {
        try {
            this.runStatus = exitCode === 0 ? "shutdown" : "shutdown_on_error";
            this.events.emit("stop_server");
            
            if (!this.cli) this.cli = (await import("../cli/cli.js")).default;
            this.cli.default.info('Shutting down...');

            setTimeout(async() => {
                this.cli?.default.info(`LeiCoin-Node stopped with exit code ${exitCode}`);
                await this.cli?.close();
                process.exit(exitCode);
            }, 1000);
        } catch {
            process.exit(1);
        }
    }

}

export default Utils.getInstance();
