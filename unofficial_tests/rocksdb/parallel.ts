
import readline from "readline";
import RocksDB from "../../build/src/storage/rocksdb/index.js";

/*
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
*/

//import { Worker, isMainThread, parentPort } from 'node:worker_threads';



const db = new RocksDB("./localtests/testdb", {
    keyEncoding: "urf8",
    valueEncoding: "uft8"
})
console.log("initialized");

await db.open();
console.log("opened");

while (true) {
    await new Promise(async(resolve) =>{
        for (let i = 0; i < 100_000; i++) {
            await db.put(i.toString(), Math.random().toString());
        }
        resolve(0);
    });
    await new Promise(async(resolve) =>{ setTimeout(resolve, 1000); });
    console.log("finished putting");
}
