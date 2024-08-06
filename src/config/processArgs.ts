import cli from "../cli/cli.js";
import utils from "../utils/index.js";

class PArg {
    // default value will not be loaded when the argument is required
    default: string | number | boolean | null;
    type: "string" | "number" | "boolean";
    required: boolean;

    constructor(
        defaultValue: string | number | boolean | null,
        type: "string" | "number" | "boolean",
        required: boolean
    ) {
        this.default = defaultValue;
        this.type = type;
        this.required = required;
    }
}

type ArgsKeys = keyof typeof ProcessArgsParser.prototype.argsSettings;
type ArgsLike = {
    [key in ArgsKeys]: number | string | boolean;
}

export class ProcessArgsParser {

    public readonly argsSettings = {
        '--port' : new PArg(12200, 'number', false),
        '--host': new PArg("0.0.0.0", 'string', false),
        '--experimental': new PArg(false, 'boolean', false),
        '--only-cli': new PArg(false, 'boolean', false)
    };
    
    public parse(): ArgsLike {

        const parsedArgs: ArgsLike = {} as any;

        for (const [argName, argSettings] of Object.entries(this.argsSettings) as [ArgsKeys, PArg][]) {
            
            try {

                const argIndex = process.argv.slice(2).findIndex(arg => argName === arg)

                if (argIndex === -1) {
                    if (argSettings.required) {
                        cli.data.error(`Argument ${argName} is required`);
                        utils.gracefulShutdown(); return {} as any;
                    }
                    parsedArgs[argName] = argSettings.default as any;
                    continue;
                }

                if (argSettings.type === 'boolean') {
                    parsedArgs[argName] = true;
                    continue;
                }

                const argValue = process.argv[argIndex + 1];

                if (!argValue || argValue.startsWith('--')) {
                    cli.data.error(`Argument ${argName} requires a value`);
                    utils.gracefulShutdown(); return {} as any;
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
                cli.data.error(`Unexpected error parsing argument ${argName}: ${err.message}`);
                utils.gracefulShutdown(); return {} as any;
            }

        }

        return parsedArgs;

    }

}

export {
    type ArgsKeys as ProcessArgsKeys,
    type ArgsLike as ProcessArgsLike
};
