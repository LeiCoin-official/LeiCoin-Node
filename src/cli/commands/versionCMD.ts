import Main from "@/main.js";
import cli from "../cli.js";
import CLICMD from "../cliCMD.js";

export class VersionCMD extends CLICMD {
    readonly name = "--version";
    readonly description = "Prints the version of LeiCoin-Node.";
    readonly usage = "--version";
    readonly environment = "shell";

    async run() {
        cli.cmd.info(Main.version);
    }
}

