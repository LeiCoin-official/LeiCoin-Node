
export enum Platforms {
    "linux-x64" = "bun-linux-x64",
    "linux-arm64" = "bun-linux-arm64",

    "win-x64" = "bun-windows-x64",

    "macos-x64" = "bun-darwin-x64",
    "macos-arm64" = "bun-darwin-arm64",
}

export class Compiler {

    private command = "bun build --compile --sourcemap ./src/index.ts --outfile ./build/bin/leicoin-node";
    private platform: keyof typeof Platforms | "auto";

    constructor(platform: keyof typeof Platforms | "auto" = "auto") {
        this.platform = platform;
        if (platform !== "auto") {
            this.command += ` --target=${Platforms[platform]}`;
        }
    }

    async build() {
        try {
            const output = await Bun.$`${{ raw: this.command }}`.text()
            console.log(output);
        } catch (err) {
            console.log(`Failed with code ${err.exitCode}`);
            console.log(err.stdout.toString());
            console.log(err.stderr.toString());
        }
    }

}

