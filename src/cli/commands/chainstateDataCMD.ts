import blockchain from "../../storage/blockchain.js";
import { Uint, Uint64 } from "../../binary/uint.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";

export default class ChainstateDataCMD extends CLISubCMD {
    public name = "chainstate";
    public description = "Manage the local Chainstate";
    public usage = "chainstate <command> [args]";

    protected registerCommands(): void {
        this.register(new ReadCMD());
    }

}


class ReadCMD extends CLICMD {
    public name = "read";
    public description = "Read the current Chainstate";
    public usage = "read";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        const chainstate = blockchain.chainstate.getCompleteChainStateData();
        cli.cmd.info(JSON.stringify(chainstate, (key, value) => {
            if (value instanceof Uint) {
                return value.toHex();
            }
            return value;
        }, 2));
    }
}

