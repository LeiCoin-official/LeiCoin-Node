import { AddressHex } from "../../objects/address.js";
import { PX } from "../../objects/prefix.js";
import Validator from "../../objects/minter.js";
import blockchain from "../../storage/blockchain.js";
import { Uint, Uint64 } from "../../utils/binary.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import CLIUtils from "../cliUtils.js";

export default class MinterDBCMD extends CLISubCMD {
    public name = "vsdb";
    public description = "Manage the validator database";
    public usage = "vsdb <command> [args]";

    protected registerCommands(): void {
        this.register(new ReadCMD());
        this.register(new InsertCMD());
        this.register(new RemoveCMD());
    }

}


class ReadCMD extends CLICMD {
    public name = "read";
    public description = "Read the validator database";
    public usage = "read <all(validator_address>)";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        if (args[0] === "all") {
            cli.default.info(
                "Validators:\n" + 
                (await blockchain.minters.getAllVAddresses()).map((address) => {
                    return address.toHex();
                }).join("\n")
            );
            return;
        }

        const validatorAddress = args[0];
        const validator = await blockchain.minters.getValidator(AddressHex.from(validatorAddress));
        if (validator) {
            cli.default.info(JSON.stringify(validator, (key, value) => {
                if (value instanceof Uint64) {
                    return (value.toInt() / 1_0000_0000).toFixed(8);
                } else if (value instanceof Uint) {
                    return value.toHex();
                }
                return value;
            }, 2));
        } else {
            cli.default.info("Validator not found!");
        }

    }
}

class InsertCMD extends CLICMD {
    public name = "insert";
    public description = "Insert Data into the validator database";
    public usage = "insert <validator_address> <stake> <version>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 3) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const validator = new Validator(AddressHex.from(args[0]), Uint64.from(parseInt(args[1])), PX.from(args[2]));
        await blockchain.minters.setValidator(validator);
        cli.default.info("Validator inserted!");
    }
}

class RemoveCMD extends CLICMD {
    public name = "remove";
    public description = "Remove Data from the validator database";
    public usage = "remove <validator_address>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const validator = await blockchain.minters.getValidator(AddressHex.from(args[0]));
        if (validator) {
            await blockchain.minters.removeValidator(validator);
            cli.default.info("Validator removed!");
        } else {
            cli.default.info("Validator not found!");
        }

    }
}

