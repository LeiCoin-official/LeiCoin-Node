import { Uint, Uint64 } from "../../src/binary/uint.js";
import LCrypt from "../../src/crypto/index.js";
import { AddressHex } from "../../src/objects/address.js";
import { PX } from "../../src/objects/prefix.js";
import LevelDB from "../../src/storage/leveldb/index.js";
import { endTimer, startTimer } from "../testUtils.js";
import { LevelDBUtils } from "./leveldb_utils.js";

const metaSizeAddress = AddressHex.fromTypeAndBody(PX.META, Uint.from(2, 20));
const firstMetaAddress = AddressHex.fromTypeAndBody(PX.META, Uint.alloc(20));

async function generateMinterDB(size: number) {
    const level = await LevelDBUtils.openDB("stake4");

    const promises: Promise<void>[] = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(
                AddressHex.fromTypeAndBody(PX.A_0e, Uint.from(LCrypt.randomBytes(20))),
                Uint.concat([
                    PX.V_00,
                    Uint64.from(32_0000_0000)
                ])
            )
        );
    }

    promises.push(level.put(metaSizeAddress, Uint64.from(size)));

    await Promise.all(promises);

    return level;
}


async function selectNextMinter(slot: Uint64, level: LevelDB): Promise<AddressHex> {
    const size = await level.get(metaSizeAddress);
    const randomIndex = LCrypt.sha256(slot).mod(size);

    let count = Uint64.from(0);
    const minterAddressesStream = level.createKeyStream({lt: firstMetaAddress});
    for await (const key of minterAddressesStream) {
        if (count.eq(randomIndex)) {
            minterAddressesStream.destroy();
            return new AddressHex(key);
        }
        count.iadd(1);
    }
    process.exit(1); // Should never reach this point
}


async function testRandomness(level: LevelDB, slotsCount: number) {
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
    const mintersCount = parseInt(process.argv[2]) || 1000;
    const slotsCount = parseInt(process.argv[3]) || 1000;

    const level = await generateMinterDB(mintersCount);
    console.log(`Generated minter database with ${mintersCount} minters`);

    await testRandomness(level, slotsCount);

    await level.close();
    await LevelDBUtils.destroyDB("stake4");
}

main()