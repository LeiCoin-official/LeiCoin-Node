import { EventEmitter } from "events";
import cli from "../cli/cli.js";

class Utils {

    static readonly events = new EventEmitter();

    static get procCWD() {
        return process.cwd();
    }

    static init() {
        if (Bun.env.CUSTOM_CWD) {
            process.chdir(Bun.env.CUSTOM_CWD);
        }

        //process.on("SIGINT", this.gracefulShutdown);
        process.on("SIGTERM", this.gracefulShutdown);
    }

    private static runStatus: "running" | "shutdown" | "shutdown_on_error" = "running";
    static getRunStatus() { return this.runStatus; }

    static async gracefulShutdown(exitCode: number = 0) {
        try {
            this.runStatus = exitCode === 0 ? "shutdown" : "shutdown_on_error";
            this.events.emit("stop_server");
            
            cli.default.info('Shutting down...');

            setTimeout(async() => {
                cli.default.info(`LeiCoin-Node stopped with exit code ${exitCode}`);
                await cli.close();
                process.exit(exitCode);
            }, 1000);
        } catch {
            process.exit(1);
        }
    }

}

Utils.init();
export default Utils;
