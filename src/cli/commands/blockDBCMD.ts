import { type Block } from "../../objects/block.js";
import blockchain from "../../storage/blockchain.js";
import { Uint } from "../../utils/binary.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import CLIUtils from "../cliUtils.js";

export default class BlockDBCMD extends CLISubCMD {
    public name = "blockdb";
    public description = "Manage the Block database";
    public usage = "blockdb <command> [args]";

    protected registerCommands(): void {
        this.register(new ReadCMD());
    }

}


class ReadCMD extends CLICMD {
    public name = "read";
    public description = "Read the Block database";
    public usage = "read <index>)";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const blockIndex = args[0];
        const block = blockchain.blocks.getBlock(blockIndex).data as Block;
        if (block) {
            cli.default.info(JSON.stringify(block, (key, value) => {
                if (value instanceof Uint) {
                    return value.toHex();
                }
                return value;
            }));
        } else {
            cli.default.info(`Block with Index: ${blockIndex} not found!`);
        }

    }
}

