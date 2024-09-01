import { EventEmitter } from "events";
import cli from "../cli/cli.js";

class Utils {
    private static initialized = false;

    static readonly events = new EventEmitter();

    static get procCWD() {
        return process.cwd();
    }

    static init() {
        if (this.initialized) return;
        this.initialized = true;
        
        if (Bun.env.CUSTOM_CWD) {
            process.chdir(Bun.env.CUSTOM_CWD);
        }

        //process.on("SIGINT", this.gracefulShutdown);
        process.once("SIGTERM", this.gracefulShutdown);

        process.once("uncaughtException", this.uncaughtException);
        process.once("unhandledRejection", this.unhandledRejection);
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

    private static async uncaughtException(error: Error) {
        cli.default.error(`Uncaught Exception:\n${error.stack}`);
        Utils.gracefulShutdown(1);
    }

    private static async unhandledRejection(reason: any) {
        const error = reason.stack ? reason.stack : reason;
        cli.default.error(`Unhandled Rejection:\n${error}`);
        Utils.gracefulShutdown(1);
    }

}

Utils.init();
export default Utils;
