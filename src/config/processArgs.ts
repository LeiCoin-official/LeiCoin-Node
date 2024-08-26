import cli from "../cli/cli.js";
import utils from "../utils/index.js";


type PArgAllowedTypes = "string" | "number" | "flag" | "array";

type PArgTypeMap = {
    string: string | null;
    number: number | null;
    flag: boolean | null;
    array: string[] | null;
}

type ArgsKeys = keyof typeof ProcessArgsParser.prototype.argsSettings;
type ArgTypes = typeof ProcessArgsParser.prototype.argsSettings[ArgsKeys];
type ArgsLike<T = "default"> = {
    [key in ArgsKeys]?: T extends "default" ? typeof ProcessArgsParser.prototype.argsSettings[key]['default'] : any;
}

class PArg<T extends PArgAllowedTypes> {
    // default value will not be loaded when the argument is required
    default: PArgTypeMap[T];
    type: PArgAllowedTypes;
    required: boolean;
    fixedPosition: number | null;

    constructor(
        type: T,
        fixedPosition: number | null = null,
        required = false,
        defaultValue: PArgTypeMap[T] = null,
    ) {
        this.type = type;
        this.default = defaultValue;
        this.required = required;
        this.fixedPosition = fixedPosition;
    }
}


export class ProcessArgsParser {

    private static instance: ProcessArgsParser;

    constructor() {
        if (ProcessArgsParser.instance) {
            return ProcessArgsParser.instance;
        }
        ProcessArgsParser.instance = this;
    }

    public readonly argsSettings = {
        '--port' : new PArg("number"),
        '--host': new PArg("string"),
        '--experimental': new PArg("flag"),

        '--only-cli': new PArg("flag", 0),

        '-c' : new PArg("array", 0)
    };
    
    public parse(): ArgsLike {

        const parsedArgs: ArgsLike<any> = {} as any;

        const process_argv = process.argv.slice(2);

        for (const [argName, argSettings] of Object.entries(this.argsSettings) as [ArgsKeys, ArgTypes][]) {
            
            try {

                const argIndex = process_argv.findIndex(arg => argName === arg)

                if (argIndex === -1) {
                    if (argSettings.required) {
                        if (argSettings.default === null) {
                            cli.data.error(`Argument ${argName} is required`);
                            utils.gracefulShutdown(1); return {} as any;
                        }
                        parsedArgs[argName] = argSettings.default;
                    }
                    continue;
                }

                if (argSettings.fixedPosition && argIndex !== argSettings.fixedPosition) {
                    cli.data.error(`Argument ${argName} cannot be used with other arguments`);
                    utils.gracefulShutdown(1); return {} as any;
                }

                function getArgValue() {
                    const argValue = process_argv[argIndex + 1];
                    if (!argValue || argValue.startsWith('-')) {
                        cli.data.error(`Argument ${argName} requires a value`);
                        utils.gracefulShutdown(1);
                    }
                    return argValue;
                }

                switch (argSettings.type) {
                
                    case 'flag':
                        parsedArgs[argName] = true;
                        break;
                    case 'array':
                        parsedArgs[argName] = process_argv.slice(argIndex + 1);
                        break;
                    case 'number':
                        parsedArgs[argName] = parseFloat(getArgValue());
                        break;
                    case "string":
                        parsedArgs[argName] = getArgValue();
                        break;

                }

            } catch (err: any) {
                cli.data.error(`Unexpected error parsing argument ${argName}: ${err.stack}`);
                utils.gracefulShutdown(1); return {} as any;
            }

        }

        return parsedArgs;

    }

}

export {
    type ArgsKeys as ProcessArgsKeys,
    type ArgsLike as ProcessArgsLike
};
