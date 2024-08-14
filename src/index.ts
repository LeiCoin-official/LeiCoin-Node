
export default class Main {

    public static version = "0.5.3-beta.1";

    private static initialized = false;

    public static async init() {
        if (this.initialized) return;
        this.initialized = true;

        // Core modules
        const utils = (await import("./utils/index.js")).default;

        const cli = (await import("./cli/cli.js")).default;
        await cli.setup();
    
        cli.default.info(`Starting LeiCoin-Node v${Main.version}`);
        cli.default.info(`Loaded core modules`);

        const config = (await import("./config/index.js")).default;

        if (utils.getRunStatus() === "shutdown_on_error") {
            cli.default.error("Error during startup");
            return;
        }

        await (await import("./storage/blockchain.js")).default.waitAllinit();
        
        if (config.processArgs["--only-cli"]) {

            cli.default.info(`LeiCoin-Node started in CLI Only mode`);

        } else {

            await (await import("./netInitialization.js")).default();

            (await import("./minter/index.js")).MinterClient.initIfActive();
            (await import("./pos/index.js")).POS.init();

            cli.default.info(`LeiCoin-Node started in Full Node mode`);
            
        }

    }

}

Main.init();

