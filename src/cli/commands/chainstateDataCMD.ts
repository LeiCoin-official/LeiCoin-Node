import { Blockchain } from "@leicoin/storage/blockchain";
import { DataUtils } from "@leicoin/utils/dataUtils";
import { cli } from "../cli.js";
import { CLICMD, CLISubCMD } from "../handler/command.js";

export class ChainstateDataCMD extends CLISubCMD {
    readonly name = "chainstate";
    readonly description = "Manage the local Chainstate";
    readonly usage = "chainstate <command> [...args]";

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
    readonly name = "read";
    readonly description = "Read the current Chainstate";
    readonly usage = "read";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        const chainstate = Blockchain.chainstate.getCompleteChainStateData();
        cli.cmd.info(DataUtils.stringify(chainstate, null, 2));
    }
}

