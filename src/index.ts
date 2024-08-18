
export default class Main {

    public static version = "0.5.3-beta.1";

    private static environment: "full" | "cli" | "command";

    private static initialized = false;

    public static async init() {
        if (this.initialized) return;
        this.initialized = true;

        if (process.argv.slice(2)[0] === "-c") {
            process.env.NO_OUTPUT = "true";
        } else {
            console.log(`Starting LeiCoin-Node v${Main.version}...`);
        }

        // Core modules
        const utils = (await import("./utils/index.js")).default;

        const cli = (await import("./cli/cli.js")).default;
        await cli.setup();

        const config = (await import("./config/index.js")).default;

        if (utils.getRunStatus() === "shutdown_on_error") {
            cli.default.error("Error during startup");
            return;
        }

        this.environment = "full";
        if (config.processArgs["--only-cli"]) {
            this.environment = "cli";
        } else if (config.processArgs["-c"]) {
            this.environment = "command"
        };

        cli.default.info(`Loaded core modules`);

        await (await import("./storage/blockchain.js")).default.waitAllinit();

        switch (this.environment) {
            case "full": {
                await (await import("./netInitialization.js")).default();

                (await import("./minter/index.js")).MinterClient.initIfActive();
                (await import("./pos/index.js")).POS.init();
    
                cli.default.info(`LeiCoin-Node started in Full Node mode`);

                break;
            }
            case "cli": {
                cli.default.info(`LeiCoin-Node started in CLI Only mode`);
                break;
            }
            case "command": {

                const args = config.processArgs["-c"] as string[];

                if (!args[0]) {
                    cli.cmd.info("Command not recognized. Type leicoin-node -c help for available commands.");
                    utils.gracefulShutdown(0);
                    return;
                }

                const CLICMDHandler = (await import("./cli/cliCMDHandler.js")).default;

                await CLICMDHandler.getInstance().run(
                    args.map(arg => arg.toLowerCase())
                        .filter(arg => arg),
                    []
                );

                utils.gracefulShutdown(0);
                break;
            }
        }

    }

}

Main.init();

