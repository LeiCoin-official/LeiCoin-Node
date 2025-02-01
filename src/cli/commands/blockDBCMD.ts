import { type Block } from "@leicoin/common/models/block";
import { Blockchain } from "@leicoin/storage/blockchain";
import { DataUtils } from "@leicoin/utils/dataUtils";
import { cli } from "../cli.js";
import { CLICMD } from "@cleverjs/cli";
import { CLIUtils } from "../utils.js";
import { CLISubCMD } from "../handler/command.js";

export class BlockDBCMD extends CLISubCMD {
    readonly name = "blockdb";
    readonly description = "Manage the Block database";
    readonly usage = "blockdb <command> [...args]";

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
    readonly description = "Read the Block database";
    readonly usage = "read <index>";

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

