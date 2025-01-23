import { Main } from "@leicoin/core";
import { cli } from "./cli.js";
import { type CLICMD } from "./handler/command.js";


export class CLIUtils {

    static canRunInCurrentEnvironment(cmd: CLICMD) {
        if (cmd.environment === "all") return true;
        if (Main.environment === "command") {
            return cmd.environment === "shell";
        }
        return cmd.environment === "runtime";
    }

    static parsePArgs(parent_args: string[], appendSpaceIFNotEmpty = false): string {
        let parent_args_str = parent_args.join(" ");
        if (appendSpaceIFNotEmpty && parent_args_str) {
            parent_args_str += " ";
        }
        return parent_args_str;
    }

    static invalidNumberOfArguments(): void {
        cli.cmd.info("Invalid number of arguments!");
    }

}



