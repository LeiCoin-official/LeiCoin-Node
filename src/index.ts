
export default class Main {

    public static version = "0.5.2-beta.2";

    private static initialized = false;

    public static async init() {
        if (this.initialized) return;
        this.initialized = true;

        // Core modules
        (await import("./utils/index.js"));

        const cli = (await import("./cli/cli.js")).default;
        await cli.setup();
    
        const config = (await import("./config/index.js")).default;

        cli.default.info(`Starting LeiCoin-Node v${Main.version}`);
        cli.default.info(`Loaded core modules`);

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

