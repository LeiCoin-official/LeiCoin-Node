import { Blockchain } from "../../storage/blockchain.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import { DataUtils } from "../../utils/dataUtils.js";

export default class ChainstateDataCMD extends CLISubCMD {
    public name = "chainstate";
    public description = "Manage the local Chainstate";
    public usage = "chainstate <command> [...args]";

    protected registerCommands(): void {
        this.register(new ReadCMD());
    }

    async run(args: string[], parent_args: string[]) {
        await Blockchain.init();
        await Blockchain.waitAllChainsInit();

        super.run(args, parent_args);
    }

}


class ReadCMD extends CLICMD {
    public name = "read";
    public description = "Read the current Chainstate";
    public usage = "read";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        const chainstate = Blockchain.chainstate.getCompleteChainStateData();
        cli.cmd.info(DataUtils.stringify(chainstate, null, 2));
    }
}

