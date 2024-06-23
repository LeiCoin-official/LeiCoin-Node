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

    public async gracefulShutdown(exitCode: number = 0) {
        try {
            if (!this.cli)
            this.cli = (await import("../cli/cli.js")).default;
            this.cli.default_message.info('Shutting down...');
            this.events.emit("stop_server");
            setTimeout(async() => {
                this.cli?.default_message.info('LeiCoin-Node stopped.');
                await this.cli?.close();
                process.exit(exitCode);
            }, 1000);
        } catch {
            process.exit(1);
        }
    }

}

export default Utils.getInstance();
