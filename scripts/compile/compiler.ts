
export enum Platforms {
    "linux-x64" = "bun-linux-x64",
    "linux-x64-baseline" = "bun-linux-x64-baseline",
    "linux-x64-modern" = "bun-linux-x64-modern",
    "linux-arm64" = "bun-linux-arm64",

    "win-x64" = "bun-windows-x64",
    "win-x64-baseline" = "bun-windows-x64-baseline",
    "win-x64-modern" = "bun-windows-x64-modern",

    "macos-x64" = "bun-darwin-x64",
    "macos-x64-baseline" = "bun-darwin-x64-baseline",
    "macos-x64-modern" = "bun-darwin-x64-modern",
    "macos-arm64" = "bun-darwin-arm64",
}

export type PlatformArg = keyof typeof Platforms | "auto";

export class Compiler {

    private command = "bun build --compile --sourcemap ./src/index.ts --outfile ./build/bin/leicoin-node";
    private platform: PlatformArg;

    constructor(platform: PlatformArg) {
        this.platform = platform;
        if (platform !== "auto") {

            if (Object.keys(Platforms).some(p => p === platform) === false) {
                throw new Error(`Invalid platform: ${platform}`);
            }
            
            this.command += `-${platform} --target=${Platforms[platform]}`;
        }
    }

    async build() {
        try {
            const output = await Bun.$`echo "Building from sources. Platform: ${this.platform}"; ${{ raw: this.command }}`.text()
            console.log(output);
        } catch (err) {
            console.log(`Failed with code ${err.exitCode}`);
            console.log(err.stdout.toString());
            console.log(err.stderr.toString());
        }
    }

}

