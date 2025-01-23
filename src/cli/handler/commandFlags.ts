import { EncodingUtils } from "@leicoin/encoding";
import { type Dict } from "@leicoin/utils/dataUtils";

type AllowedTypes = "string" | "number" | "bool";

type TypesMap = {
    string: string | null;
    number: number | null;
    bool: boolean | null;
}

type FlagsSettings = Dict<CMDFlag<AllowedTypes>, string>;

type FlagKeys<T extends FlagsSettings> = keyof T & string;
type FlagTypes<T extends FlagsSettings> = T[FlagKeys<T>];
export type FlagsParsingResult<P extends FlagsSettings, T = "default"> = {
    [key in FlagKeys<P>]?: T extends "default" ? P[key]['defaultValue'] : any;
}


export class CMDFlag<T extends AllowedTypes> {
    constructor(type: T, description: string, required?: false, defaultValue?: null);
    constructor(type: T, description: string, required: true, defaultValue: TypesMap[T]);
    constructor(
        readonly type: T,
        readonly description: string,
        readonly required = false,
        readonly defaultValue: TypesMap[T] = null // default value only will be loaded when the flag is required
    ) {}
}


export class CMDFlagsParser<T extends FlagsSettings> {

    constructor(readonly flagsSettings: T) {}


    /**
     * Parses an array of flag strings and returns a result object containing the parsed flags.
     * If any errors occur during parsing, a descriptive error message is returned.
     *
     * @param {string[]} flags An array of flag strings to be parsed.
     * @param {boolean} [skipUnknownFlagsAndDeleteKnown=false] Whether to skip unknown flags and delete known flags from the input array.
     * @returns An object containing the parsed flags or an error message.
     *
     * @example
     * const flags = ["--verbose", "--timeout=30"];
     * const result = parse(flags);
     * if (typeof result === 'string') {
     *   console.error(result);
     * } else {
     *   console.log(result);
     * }
     */
    public parse(flags: string[], skipUnknownFlagsAndDiscard?: false): FlagsParsingResult<T> | string;
    public parse(flags: string[], skipUnknownFlagsAndDiscard: true): { result: FlagsParsingResult<T>, discarded: string[] } | string;
    public parse(flags: string[], skipUnknownFlagsAndDiscard: boolean): { result: FlagsParsingResult<T>, discarded: string[] } | FlagsParsingResult<T> | string;
    public parse(flags: string[], skipUnknownFlagsAndDiscard: boolean = false) {
        const flagsCopy: string[] = [];

        const parsedFlags: FlagsParsingResult<T> = {};
        const providedFlags: string[] = [];

        for (const data of flags) {

            const [flagName, flagValue] = EncodingUtils.splitNTimes(data, "=", 1) as [FlagKeys<T>, string | undefined];
            const flagSettings = this.flagsSettings[flagName];

            if (!flagSettings) {
                if (skipUnknownFlagsAndDiscard) {
                    flagsCopy.push(data);
                    continue;
                }
                return `Unknown flag '${flagName}'`;
            }
            providedFlags.push(flagName);

            switch (flagSettings.type) {
                case 'bool':
                    parsedFlags[flagName] = true;
                    break;
                case 'number':
                    const parsedValue = parseFloat(flagValue as string);
                    if (typeof parsedValue !== "number") return `Flag '${flagName}' requires a numeric value`;
                    parsedFlags[flagName] = parsedValue;
                    break;
                case "string":
                    if (!flagValue) return `Flag '${flagName}' requires a value`;
                    parsedFlags[flagName] = flagValue;
                    break;
            }
        }

        for (const [flagName, flagSettings] of Object.entries(this.flagsSettings) as [FlagKeys<T>, FlagTypes<T>][]) {
            if (flagSettings.required && !providedFlags.includes(flagName)) {
                if (flagSettings.defaultValue === null) {
                    return `Flag '${flagName}' is required`;
                }
                parsedFlags[flagName] = flagSettings.defaultValue;
            }
        }

        if (skipUnknownFlagsAndDiscard) {
            return { result: parsedFlags, discarded: flagsCopy };
        }

        return parsedFlags;
    }

}
