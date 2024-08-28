
export enum Platforms {
    "linux-x64" = "bun-linux-x64-modern",
    "linux-x64-baseline" = "bun-linux-x64-baseline",
    "linux-arm64" = "bun-linux-arm64",

    "win-x64" = "bun-windows-x64-modern",
    "win-x64-baseline" = "bun-windows-x64-baseline",

    "macos-x64" = "bun-darwin-x64-modern",
    "macos-x64-baseline" = "bun-darwin-x64-baseline",
    "macos-arm64" = "bun-darwin-arm64",
}

export type PlatformArg = keyof typeof Platforms | "auto";

class CompilerBuilder {

    public sourcemap = true;
    public entrypoint = "./src/index.ts";
    public outfile = "./build/bin/leicoin-node";
    public env: NodeJS.ProcessEnv = {};

    constructor(private baseCommand = "bun build --compile") {}

    public setArg(arg: string) {
        //this.command += ` ${arg}`;
    }

    public getCommand() {
        return [
            this.baseCommand,
            (this.sourcemap ? " --sourcemap" : ""),
            this.entrypoint,
            "--outfile", this.outfile,
            ...Object.entries(this.env).map(([key, value]) => `--define "Bun.env.${key}='${value}'"`)
        ].join(" ");
    }

}

export class Compiler {

    private command = new CompilerBuilder();

    constructor(
        private platform: PlatformArg,
        private version: string,
        versionInFileName: boolean
    ) {
        if (versionInFileName) {
            this.command.outfile += `-v${version}`;
        }

        if (platform !== "auto") {
            if (Object.keys(Platforms).some(p => p === platform) === false) {
                throw new Error(`Invalid platform: ${platform}`);
            }
            this.command.outfile += `-${platform} --target=${Platforms[platform]}`;
        }
        
        this.command.env.LEICOIN_NODE_VERSION = version;
    }

    async build() {
        try {
            const output = await Bun.$`
                echo "Building from sources. Version: ${this.version} Platform: ${this.platform}";
                ${{ raw: this.command.getCommand() }}
                `.text()
            console.log(output);
        } catch (err) {
            console.log(`Failed with code ${err.exitCode}`);
            console.log(err.stdout.toString());
            console.log(err.stderr.toString());
        }
    }

}

