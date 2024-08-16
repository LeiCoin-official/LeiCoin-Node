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

    public readonly procCWD: string;

    private constructor() {
        if (process.env.CUSTOM_CWD) {
            process.chdir(process.env.CUSTOM_CWD);
        }
        this.procCWD = process.cwd();

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
