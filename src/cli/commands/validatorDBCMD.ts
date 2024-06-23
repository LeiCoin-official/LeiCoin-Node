import { AddressHex } from "../../objects/address.js";
import blockchain from "../../storage/blockchain.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import CLIUtils from "../cliUtils.js";

export default class ValidatorDBCMD extends CLISubCMD {
    public name = "vsdb";
    public description = "Manage the validator database";
    public usage = "vsdb <command> [args]";

    protected registerCommands(): void {
        this.register(new ReadCMD());
    }

}


class ReadCMD extends CLICMD {
    public name = "read";
    public description = "Read the validator database";
    public usage = "vsdb read <validator_address>";

    public async run(args: string[], parent_args: string[]): Promise<void> {

        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const validatorAddress = args[0];
        const validator = await blockchain.validators.getValidator(AddressHex.from(validatorAddress));
        if (validator) {
            cli.default_message.info(JSON.stringify(validator));
        } else {
            cli.default_message.info("Validator not found!");
        }

    }
}

