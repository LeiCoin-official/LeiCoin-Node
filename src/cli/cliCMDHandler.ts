import Main from "../main.js";
import Utils from "../utils/index.js";
import cli from "./cli.js";
import { CLISubCMD } from "./cliCMD.js";
import BlockDBCMD from "./commands/blockDBCMD.js";
import ChainstateDataCMD from "./commands/chainstateDataCMD.js";
import CryptoCMD from "./commands/cryptoCMD.js";
import MinterDBCMD from "./commands/minterDBCMD.js";
import { RunCMD } from "./commands/runCMD.js";
import StartServiceCMD from "./commands/startServiceCMD.js";
import StopCMD from "./commands/stopCMD.js";
import WalletDBCMD from "./commands/walletDBCMD.js";
import { CMDFlag, CMDFlagsParser } from "./flags.js";


export class CLICMDHandler extends CLISubCMD {
    public name = "root";
    public description = "CLI Root";
    public usage = "Command has no usage";

    private flagParser = new CMDFlagsParser({
        '--cwd': new CMDFlag("string", "Set Directory where data, logs and config is stored")
    });

    private static instance: CLICMDHandler;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CLICMDHandler();
        }
        return this.instance;
    }

    protected registerCommands(): void {
        this.register(new RunCMD());
        this.register(new StopCMD());
        this.register(new CryptoCMD());
        this.register(new WalletDBCMD());
        this.register(new MinterDBCMD());
        this.register(new BlockDBCMD());
        this.register(new ChainstateDataCMD());
        this.register(new StartServiceCMD())
    }

    protected async run_empty(parent_args: string[]): Promise<void> {
        //cli.cmd.info(`Command not recognized. Type "${CLIUtils.parsePArgs(parent_args, true)}help" for available commands.`);
        return;
    }

    public async run(args: string[], parent_args: string[]) {

        if (Main.environment === "command") {

            const parsingResult = this.flagParser.parse(args, true);
            if (typeof parsingResult === "string") {
                cli.default.error(parsingResult);
                Utils.gracefulShutdown(1); return;
            }

            const flags = parsingResult.result;
            args = parsingResult.discarded;


            if (flags["--cwd"]) {
                try {
                    process.chdir(flags["--cwd"]);
                } catch (err: any) {
                    cli.default.error(`Failed to set working directory: ${err.message}`);
                    Utils.gracefulShutdown(1); return;
                }
            }

            if (args[0] !== "run") {
                await cli.init("cmd", "none", false, false, Utils.procCWD);
            }

            if (!args[0]) {
                args.push("help");
            }
            
        }
        
        await super.run(args, parent_args);
    }

    public async handle(input: string) {
        await this.run(input.trim().toLowerCase().split(" ").filter(arg => arg), []);
    }

}

export default CLICMDHandler;

