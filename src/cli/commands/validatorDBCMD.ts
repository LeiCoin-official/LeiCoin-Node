import CLICMD, { CLISubCMD } from "../cliCMD.js";

export default class ValidatorDBCMD extends CLISubCMD {
    public name = "vsdb";
    public description = "Manage the validator database";
    public usage = "vsdb <command> [args]";

    protected registerCommands(): void {
        
    }

}

