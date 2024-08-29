import { readdirSync as fs_readdirSync } from "fs";

const TestnetTests = new class TestnetTests {

    private tests = fs_readdirSync(__dirname, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    constructor() {}

    async run() {
        const argv = process.argv.slice(2);
        const test = argv[0];

        if (!test) {
            console.log("No test specified");
            this.useHelp();
            return;
        }

        if (test === "help") {
            this.help();
            return;
        }

        if (!this.tests.includes(test)) {
            console.log(`Test ${test} not found`);
            this.useHelp
            return;
        }

        await Bun.$`bun run ./testnet/${{ raw: test }}/index.ts ${{ raw: argv.slice(1).join(" ") }}`;
    }

    public useHelp() {
        console.log("Run `bun run testnet help` for a list of tests")
    } 

    public help() {
        console.log("Testnet tests available:");
        console.log(this.tests.join(", "));
        console.log("Useage: bun run testnet <test> [options]")
    }

}();

await TestnetTests.run();
