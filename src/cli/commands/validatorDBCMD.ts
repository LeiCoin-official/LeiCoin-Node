import { AddressHex } from "../../objects/address.js";
import { PX } from "../../objects/prefix.js";
import Validator from "../../objects/validator.js";
import blockchain from "../../storage/blockchain.js";
import { Uint, Uint64 } from "../../utils/binary.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import CLIUtils from "../cliUtils.js";

export default class ValidatorDBCMD extends CLISubCMD {
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
            cli.default_message.info(
                "Validators:\n" + 
                (await blockchain.validators.getAllVAddresses()).map((address) => {
                    return address.toHex();
                }).join("\n")
            );
            return;
        }

        const validatorAddress = args[0];
        const validator = await blockchain.validators.getValidator(AddressHex.from(validatorAddress));
        if (validator) {
            cli.default_message.info(JSON.stringify(validator, (key, value) => {
                if (value instanceof Uint64) {
                    return value.toInt().toLocaleString();
                } else if (value instanceof Uint) {
                    return value.toHex();
                }
                return value;
            }));
        } else {
            cli.default_message.info("Validator not found!");
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
        await blockchain.validators.setValidator(validator);
        cli.default_message.info("Validator inserted!");
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

        const validator = await blockchain.validators.getValidator(AddressHex.from(args[0]));
        if (validator) {
            await blockchain.validators.removeValidator(validator);
            cli.default_message.info("Validator removed!");
        } else {
            cli.default_message.info("Validator not found!");
        }

    }
}

