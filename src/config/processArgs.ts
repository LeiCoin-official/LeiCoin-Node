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
    [key in ArgsKeys]?: T extends "default" ? typeof ProcessArgsParser.prototype.argsSettings[key]['defaultValue'] : any;
}

class PArg<T extends PArgAllowedTypes> {
    constructor(type: "array" extends T?T:T, lastArg: true, required?: false, defaultValue?: null);
    constructor(type: "array" extends T?T:T, lastArg: true, required: true, defaultValue: PArgTypeMap[T]);
    constructor(type: Exclude<T, "array">, lastArg?: boolean, required?: false, defaultValue?: null);
    constructor(type: Exclude<T, "array">, lastArg: boolean, required: true, defaultValue: PArgTypeMap[T]);
    constructor(
        readonly type: T,
        readonly lastArg = false,
        readonly required = false,
        readonly defaultValue: PArgTypeMap[T] = null // default value only will be loaded when the argument is required
    ) {}
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
        "--cwd": new PArg("string"),
        '--only-cli': new PArg("flag", true),
        '-c' : new PArg("array", true)
    };
    
    public parse(): ArgsLike {

        const parsedArgs: ArgsLike<any> = {} as any;
        const process_argv = process.argv.slice(2);
        const providedArgs: string[] = [];

        let argIndex = 0;

        while (argIndex < process_argv.length) {

            const argName = process_argv[argIndex] as ArgsKeys;
            const argSettings = this.argsSettings[argName];

            if (!argSettings) {
                cli.data.error(`Unknown argument ${argName}`);
                utils.gracefulShutdown(1); return {} as any;
            }

            providedArgs.push(argName);
            
            function getArgValue(): string {
                const argValue = process_argv[argIndex + 1];
                if (!argValue || argValue.startsWith('-')) {
                    cli.data.error(`Argument ${argName} requires a value`);
                    utils.gracefulShutdown(1); return null as any;
                }
                return argValue;
            }

            switch (argSettings.type) {
                
                case 'flag':
                    parsedArgs[argName] = true;
                    argIndex++;
                    break;
                case 'array':
                    parsedArgs[argName] = process_argv.slice(argIndex + 1);
                    break;
                case 'number':
                    parsedArgs[argName] = parseFloat(getArgValue());
                    argIndex += 2;
                    break;
                case "string":
                    parsedArgs[argName] = getArgValue();
                    argIndex += 2;
                    break;

            }

            if (argSettings.lastArg) {
                break;
            }

        }


        for (const [argName, argSettings] of Object.entries(this.argsSettings) as [ArgsKeys, ArgTypes][]) {
            if (argSettings.required && !providedArgs.includes(argName)) {
                if (argSettings.defaultValue === null) {
                    cli.data.error(`Argument ${argName} is required`);
                    utils.gracefulShutdown(1); return {} as any;
                }
                parsedArgs[argName] = argSettings.defaultValue;
            }
        }

        return parsedArgs;

    }

}

export {
    type ArgsKeys as ProcessArgsKeys,
    type ArgsLike as ProcessArgsLike
};
