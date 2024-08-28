
import { Compiler, Platforms, PlatformArg } from "./compiler.js";

class CompileCMD {

    private static readonly subCMDs: {[key: string]: (args: string[]) => Promise<void>} = {
        "--help": this.help,
        "all": this.all,
        "auto": () => new Compiler("auto").build()
    };

    private static initialized = false;

    public static init() {
        if (this.initialized) return;
        this.initialized = true;
    }

    public static async run() {
        const args = process.argv.slice(2);

        if (args.length === 0) {
            await new Compiler("auto").build();
            return;
        }

        if (args[0] in this.subCMDs) {
            await this.subCMDs[args[0]](args.slice(1));
            return;
        }

        if (args.length !== 2) {
            await this.help(args);
            return;
        }

        if (Object.keys(Platforms).some(p => p === args[0])) {
            await new Compiler(args[0] as PlatformArg).build();
            return;
        }

        console.log(`Invalid platform: ${args[0]}`);
        console.log("Platforms: " + Object.keys(Platforms).join(", "));    
    }

    private static async help(args: string[]) {
        console.log("Usage: npx bun compile [<platform> | auto | all] [version]");
        console.log("Platforms: " + Object.keys(Platforms).join(", "));
    }

    private static async all(args: string[]) {
        const builds: Promise<void>[] = [];

        for (const platform in Platforms) {
            builds.push(new Compiler(platform as PlatformArg).build());
        }
        await Promise.all(builds);
    }

}

CompileCMD.init();
await CompileCMD.run();

