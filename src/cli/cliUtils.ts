import cli from "./cli.js";


export class CLIUtils {

    public static parsePArgs(parent_args: string[], appendSpaceIFNotEmpty = false): string {
        let parent_args_str = parent_args.join(" ");
        if (appendSpaceIFNotEmpty && parent_args_str) {
            parent_args_str += " ";
        }
        return parent_args_str;
    }

    public static invalidNumberOfArguments(): void {
        cli.default.info("Invalid number of arguments!");
    }

}


export default CLIUtils;

