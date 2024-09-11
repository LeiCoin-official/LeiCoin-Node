import { Uint64 } from "../../../src/binary/uint.js";
import { type LevelDB } from "../../../src/storage/leveldb/index.js";
import { endTimer, startTimer } from "../../testUtils.js";
import { LevelDBUtils } from "../leveldb_utils.js";
import { generateMinterDB, selectNextMinter } from "./utils.js";

async function testSpeed(level: LevelDB, slotsCount: number) {
    console.log("Testing speed...");
    
    const startTime = startTimer();
    for (let i = 0; i < slotsCount; i++) {
        await selectNextMinter(Uint64.from(i), level);
    }
    const elapsedTime = endTimer(startTime);

    console.log(`Tested ${slotsCount} slots in ${elapsedTime.toFixed(1)}ms`);
    console.log(`Average time per slot: ${(elapsedTime / slotsCount).toFixed(2)}ms`);
}

async function main() {
    const args = process.argv.slice(2);

    const mintersCount = parseInt(args[0]) || 1000;
    const slotsCount = parseInt(args[1]) || 1000;

    await LevelDBUtils.destroyDB("stake4");

    const level = await generateMinterDB(mintersCount);
    console.log(`Generated minter database with ${mintersCount} minters`);

    await testSpeed(level, slotsCount);

    await level.close();
}

main()