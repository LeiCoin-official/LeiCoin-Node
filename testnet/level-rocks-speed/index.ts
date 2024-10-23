import { Uint } from "low-level/uint";
import { LevelDB, RocksDB } from "./dbs.js";


function createRandomData() {
    const data = new Uint8Array(1024);
    crypto.getRandomValues(data);
    return Uint.from(data);
}

class TestRunner<T extends LevelDB | RocksDB> {

    private name: string;
    private location: string;
    private runCount: number = 0;

    private db: T;

    constructor(DBCLS: new (location: string) => T, name: string) {
        this.name = name;
        this.location = (__dirname + "/" + name.toLowerCase());

        console.log(`[${this.name}] Creating database...`);
        this.db = new DBCLS(this.location);
    }

    public async open() {
        console.log(`[${this.name}] Opening database...`);
        await this.db.open();
    }

    public async run(name: string, count: number) {
        console.log(`[${name}] Running tests...`);

        this.runCount = count;

        await this.testWrite();
        await this.testRead();
    
        await this.closeAndDelete();
    
        console.log(`[${name}] Finished tests`);
    }

    public async closeAndDelete() {
        await this.db.close();
        RocksDB.destroy(this.location, () => {});
    }

    private async testWrite() {
        const name = `[${this.name}] Write ${this.runCount.toLocaleString()} entries`;

        console.time(name);
    
        const promises: Promise<void>[] = [];
    
        for (let i = 0; i < this.runCount; i++) {
            const key = Uint.from(i);
            const value = createRandomData();
    
            promises.push(this.db.put(key, value));
        }
    
        await Promise.all(promises);

        console.timeEnd(name);
    }
    
    private async testRead() {
        const name = `[${this.name}] Read ${this.runCount.toLocaleString()} entries`;

        console.time(name);
    
        const promises: Promise<void>[] = [];
    
        for (let i = 0; i < this.runCount; i++) {
            const key = Uint.from(i);
            promises.push(this.db.get(key));
        }
    
        await Promise.all(promises);

        console.timeEnd(name);
    }    

}

async function runAll<T extends LevelDB | RocksDB>(
    DBCLS: new (location: string) => T,
    name: string,
    count: number
) {
    const runner = new TestRunner(DBCLS, name);
    await runner.open();
    await runner.run(name, count);
    await runner.closeAndDelete();
}

async function main() {
    const count = 10_000;

    await runAll(RocksDB, "RocksDB", count); 
    await runAll(LevelDB, "LevelDB", count);
}

await main();

