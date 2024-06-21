import { CLICMD } from "../cliCMD.js";

export class ValidatorDBCMD extends CLICMD {
    public name = "validator-db";
    public description = "Manage the validator database";
    public aliases = ["vsdb"];
    public usage = "validator-db <command> [args]";

    public async run(args: string[]): Promise<void> {
        


    }

}

