import { Command } from "../command.js";
import { Platforms } from "../compiler.js";

export const HelpCMD = new class HelpCMD extends Command {
    async run(args: string[]) {
        console.log("Usage: bun compile [<platform> | auto | all] [version]");
        console.log("Platforms: " + Object.keys(Platforms).join(", "));
    }
}();
