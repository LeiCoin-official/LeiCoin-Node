import cli from "./cli/cli.js";
import Utils from "./utils/index.js";
import HTTP_API from "./http_api/index.js";
import LeiCoinNetNode from "./leicoin-net/index.js";
import MinterClient from "./minter/index.js";
import POS from "./pos/index.js";
import { Blockchain } from "./storage/blockchain.js";
import { Configs } from "./config/index.js";

export default class Main {

    private static initialized = false;

    static readonly version = Bun.env.LEICOIN_NODE_VERSION || "DEV";

    private static environment: "full" | "cli" | "command";

    public static async init() {
        if (this.initialized) return;
        this.initialized = true;

        const processArgs = Configs.loadProcessArgs();

        if (processArgs["--cwd"]) {
            try {
                process.chdir(processArgs["--cwd"]);
            } catch (err: any) {
                cli.default.error(`Failed to set working directory: ${err.message}`);
                Utils.gracefulShutdown(1); return;
            }
        }

        if (processArgs["-c"]) {
            await cli.init("cmd", "none", false, false, Utils.procCWD);
        } else {
            await cli.init("all", "all", true, true, Utils.procCWD);
            cli.default.info(`Starting LeiCoin-Node v${Main.version}...`);
        }

        const config = Configs.loadFullConfig();

        if (Utils.getRunStatus() === "shutdown_on_error") {
            cli.default.error("Error during startup");
            return;
        }

        this.environment = "full";
        if (config.processArgs["--only-cli"]) {
            this.environment = "cli";
        } else if (config.processArgs["-c"]) {
            this.environment = "command"
        };

        await Blockchain.init();
        await Blockchain.waitAllChainsInit();

        cli.default.info(`Loaded core modules`);

        switch (this.environment) {
            case "full": {

                await LeiCoinNetNode.init();
                await LeiCoinNetNode.start({
                    ...config.leicoin_net,
                    peers: config.peers,
                    eventHandler: Utils.events
                });

                if (config.api.active) {
                    await HTTP_API.init();
                    await HTTP_API.start({
                        ...config.api,
                        eventHandler: Utils.events 
                    });
                }

                const minters: MinterClient[] = [];
                if (config.staker.active) {
                    minters.push(...MinterClient.createMinters(config.staker.stakers));
                }
                
                POS.init(minters);
                POS.start();

                cli.default.info(`LeiCoin-Node started in Full Node mode`);
                break;
            }
            case "cli": {
                cli.default.info(`LeiCoin-Node started in CLI Only mode`);
                break;
            }
            case "command": {

                const args = config.processArgs["-c"] as string[];

                const CLICMDHandler = (await import("./cli/cliCMDHandler.js")).default;

                if (!args[0]) {
                    args.push("help");
                }

                await CLICMDHandler.getInstance().run(
                    args.map(arg => arg.toLowerCase())
                        .filter(arg => arg),
                    []
                );

                Utils.gracefulShutdown(0);
                break;
            }
        }

    }

}

Main.init();

