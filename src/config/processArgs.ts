import cli from "../cli/cli.js";
import utils from "../utils/index.js";


type PArgAllowedTypes = "string" | "number" | "boolean";

type PArgTypeMap = {
    string: string | null;
    number: number | null;
    boolean: boolean | null;
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

    constructor(
        defaultValue: PArgTypeMap[T],
        type: T,
        required = false
    ) {
        this.default = defaultValue;
        this.type = type;
        this.required = required;
    }
}


export class ProcessArgsParser {

    public readonly argsSettings = {
        '--port' : new PArg(12200, "number"),
        '--host': new PArg("0.0.0.0", "string"),
        '--experimental': new PArg(false, "boolean"),
        '--only-cli': new PArg(false, "boolean")
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
                        continue;
                    }
                    continue;
                }

                if (argSettings.type === 'boolean') {
                    parsedArgs[argName] = true;
                    continue;
                }

                const argValue = process_argv[argIndex + 1];

                if (!argValue || argValue.startsWith('--')) {
                    cli.data.error(`Argument ${argName} requires a value`);
                    utils.gracefulShutdown(1); return {} as any;
                }

                switch (argSettings.type) {
                    case 'number': {
                        parsedArgs[argName] = parseFloat(argValue);
                        break;
                    }
                    case 'string': {
                        parsedArgs[argName] = argValue;
                        break;
                    }
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
