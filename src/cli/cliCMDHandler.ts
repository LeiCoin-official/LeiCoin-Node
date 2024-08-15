import { CLISubCMD } from "./cliCMD.js";
import BlockDBCMD from "./commands/blockDBCMD.js";
import ChainstateDataCMD from "./commands/chainstateDataCMD.js";
import CryptoCMD from "./commands/cryptoCMD.js";
import MinterDBCMD from "./commands/minterDBCMD.js";
import StopCMD from "./commands/stopCMD.js";
import WalletDBCMD from "./commands/walletDBCMD.js";


export class CLICMDHandler extends CLISubCMD {
    public name = "root";
    public description = "CLI Root";
    public usage = "Command has no usage";

    private static instance: CLICMDHandler;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CLICMDHandler();
        }
        return this.instance;
    }

    protected registerCommands(): void {
        this.register(new StopCMD());
        this.register(new CryptoCMD());
        this.register(new WalletDBCMD());
        this.register(new MinterDBCMD());
        this.register(new BlockDBCMD());
        this.register(new ChainstateDataCMD());
    }

    protected async run_empty(parent_args: string[]): Promise<void> {
        //cli.default.info(`Command not recognized. Type "${CLIUtils.parsePArgs(parent_args, true)}help" for available commands.`);
        return;
    }

    public async handle(input: string) {
        this.run(input.trim().toLowerCase().split(" ").filter(arg => arg), []);
    }

}

export default CLICMDHandler;

