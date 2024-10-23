import { Uint } from "low-level"
import LCrypt from "../../src/crypto/index.js"

function getMessageTypeID(name: string) {
    return LCrypt.sha256(Uint.from(name.toLowerCase(), "utf8")).slice(-2)
}

function printUsage() {
    console.error("Usage: getLNMessageTypeID [--code] <name>");
}

function main() {

    const args = process.argv.slice(2);

    if (args.length < 1 || args.length > 2) {
        printUsage(); return;
    }
    
    if (args[0] == "--code") {

        if (!args[1]) {
            printUsage(); return;
        }

        const name = args[1];
        const id = getMessageTypeID(name);

        console.log(`static readonly ${args[1].toUpperCase()} = LNMsgType.from("${id.toHex()}");`);

    } else {
        console.log(getMessageTypeID(args[0]).toHex());
    }

}

main();
