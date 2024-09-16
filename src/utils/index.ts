import { EventEmitter } from "events";
import cli from "../cli/cli.js";
import HTTP_API from "../http_api/index.js";
import POS from "../pos/index.js";
import LeiCoinNetNode from "../leicoin-net/index.js";
import { Blockchain } from "../storage/blockchain.js";
import { IModuleLike, ModuleLike } from "./dataUtils.js";

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
        process.once("SIGTERM", Utils.gracefulShutdown);

        process.once("uncaughtException", Utils.uncaughtException);
        process.once("unhandledRejection", Utils.unhandledRejection);
    }

    private static runStatus: "running" | "shutdown" | "shutdown_on_error" = "running";
    static getRunStatus() { return this.runStatus; }

    static async gracefulShutdown(exitCode: number = 0) {
        try {
            this.runStatus = exitCode === 0 ? "shutdown" : "shutdown_on_error";
            
            await Promise.all([
                this.stopService(HTTP_API),
                this.stopService(POS),
                this.stopService(LeiCoinNetNode)
            ]);

            await Blockchain.stop();
            
            cli.default.info('Shutting down...');

            setTimeout(async() => {
                cli.default.info(`LeiCoin-Node stopped with exit code ${exitCode}`);
                await cli.close();
                process.exit(exitCode);
            }, 1000);
        } catch (error: any) {
            cli.default.error(`Uncaught Exception:\n${error.stack}`);
            this.forceShutdown();
        }
    }

    private static async stopService(service: IModuleLike) {
        try {
            if (!service.started) return;
            await service.stop();
        } catch (error: any) {
            cli.default.error(`Error stopping service: ${error.message}`);
        }

    }

    private static forceShutdown() {
        process.once("SIGTERM", ()=>{});
        process.exit(1);
    }

    private static async uncaughtException(error: Error) {
        cli.default.error(`Uncaught Exception:\n${error.stack}`);
        Utils.gracefulShutdown(1);
    }

    private static async unhandledRejection(reason: any) {
        if (reason.stack) {
            // reason is an error
            return Utils.uncaughtException(reason);
        }
        cli.default.error(`Unhandled Rejection:\n${reason}`);
        Utils.gracefulShutdown(1);
    }

}

Utils.init();
export default Utils;
