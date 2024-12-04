import { AddressHex } from "../../objects/address.js";
import { PX } from "../../objects/prefix.js";
import Minter from "../../objects/minter.js";
import { Blockchain } from "../../storage/blockchain.js";
import { Uint, Uint64 } from "low-level";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import CLIUtils from "../cliUtils.js";
import { DataUtils } from "../../utils/dataUtils.js";

export default class MinterDBCMD extends CLISubCMD {
    public name = "minterdb";
    public description = "Manage the Minter database";
    public usage = "minterdb <command> [...args]";

    protected registerCommands(): void {
        this.register(new ReadCMD());
        this.register(new InsertCMD());
        this.register(new RemoveCMD());
        this.register(new GetNextMinterCMD());
    }

    async run(args: string[], parent_args: string[]) {
        await Blockchain.init();
        await Blockchain.waitAllChainsInit();

        super.run(args, parent_args);
    }

}


class ReadCMD extends CLICMD {
    public name = "read";
    public description = "Read the Minter database";
    public usage = "read (<minter_address> | all)";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        if (args[0] === "all") {
            cli.cmd.info(
                "Minters:\n" + 
                (await Blockchain.minters.getAllKeys()).map((address) => {
                    return address.toHex();
                }).join("\n")
            );
            return;
        }

        const minterAddress = args[0];
        const minter = await Blockchain.minters.getMinter(AddressHex.from(minterAddress));
        if (minter) {
            cli.cmd.info(DataUtils.stringify(minter, (key, value) => {
                if (key === "stake") {
                    return (value.toInt() / 100).toFixed(2);
                }
            }, 2));
        } else {
            cli.cmd.info("Minter not found!");
        }

    }
}

class InsertCMD extends CLICMD {
    public name = "insert";
    public description = "Insert Data into the Minter database";
    public usage = "insert <minter_address> <stake> <version>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 3) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const minter = new Minter(AddressHex.from(args[0]), Uint64.from(parseInt(args[1])), PX.from(args[2]));
        await Blockchain.minters.setMinter(minter);
        cli.cmd.info("Minter inserted!");
    }
}

class RemoveCMD extends CLICMD {
    public name = "remove";
    public description = "Remove Data from the Minter database";
    public usage = "remove <minter_address>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const minter = await Blockchain.minters.getMinter(AddressHex.from(args[0]));
        if (minter) {
            await Blockchain.minters.removeMinter(minter);
            cli.cmd.info("Minter removed!");
        } else {
            cli.cmd.info("Minter not found!");
        }

    }
}

class GetNextMinterCMD extends CLICMD {
    public name = "getnext";
    public description = "Get the next minter for a slot";
    public usage = "getnext <slot>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const slot = Uint64.from(parseInt(args[0]));
        const nextMinter = await Blockchain.minters.selectNextMinter(slot);
        cli.cmd.info(`Next minter for slot ${slot.toBigInt()}: ${nextMinter.toHex()}`);
    }

}
