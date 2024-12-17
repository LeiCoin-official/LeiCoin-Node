import { type Block } from "../../objects/block.js";
import { Blockchain } from "../../storage/blockchain.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import CLIUtils from "../cliUtils.js";
import { DataUtils } from "../../utils/dataUtils.js";

export default class BlockDBCMD extends CLISubCMD {
    public name = "blockdb";
    public description = "Manage the Block database";
    public usage = "blockdb <command> [...args]";

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
    public description = "Read the Block database";
    public usage = "read <index>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const blockIndex = args[0];
        const block = Blockchain.blocks.get(blockIndex).data as Block;
        if (block) {
            cli.cmd.info(DataUtils.stringify(block, null, 2));
        } else {
            cli.cmd.info(`Block with Index: ${blockIndex} not found!`);
        }

    }
}

