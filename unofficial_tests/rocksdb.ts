
import readline from "readline";
import RocksDB from "../build/src/storage/rocksdb/index.js";

const db = new RocksDB("./localtests/testdb", {
    keyEncoding: "urf8",
    valueEncoding: "uft8"
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("SIGINT", () => {
    console.log("^C");
    rl.prompt();
});
rl.setPrompt("> ");
rl.prompt();

rl.on("line", async (line) => {
    if (line === "exit") {
        rl.close();
        return;
    }

    try {
        console.log(await eval(line));
    } catch (err) {
        console.log(err.stack)
    }

    rl.prompt();
});

