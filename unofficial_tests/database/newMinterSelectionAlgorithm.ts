import { UintMap } from "../../src/binary/map.js";
import { Uint, Uint64 } from "../../src/binary/uint.js";
import LCrypt from "../../src/crypto/index.js";
import { AddressHex } from "../../src/objects/address.js";
import { PX } from "../../src/objects/prefix.js";
import LevelDB from "../../src/storage/leveldb/index.js";
import { endTimer, startTimer } from "../testUtils.js";
import { LevelDBUtils } from "./leveldb_utils.js";
import crypto from "crypto";

async function generateMinterDB(size: number) {

    const level = await LevelDBUtils.openDB("stake1");
    
    const validator_preifx = PX.A_0e;
    const version_Prefix = PX.V_00;

    const promises: Promise<void>[] = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(
                AddressHex.fromTypeAndBody(validator_preifx, Uint.from(LCrypt.randomBytes(20))),
                Uint.concat([
                    version_Prefix,
                    Uint64.from(32_0000_0000)
                ])
            )
        );
    }

    await Promise.all(promises);
    return level;
}

async function getRandomKey(db: LevelDB, stepSize = 256): Promise<Uint> {
    // Step 1: First pass, sample keys to get ranges (every sampleSize-th key)
    const keyRanges: Uint[] = [];

    const firstAddress = AddressHex.fromTypeAndBody(PX.A_0c, Uint.from(0))

    return new Promise(async (resolve, reject) => {
        let stream = db.createKeyStream({gte: firstAddress});
        let count = 0;

        stream.on('data', (key: Uint) => {
            // Store every sampleSize-th key in memory
            if (count % stepSize === 0) {
                keyRanges.push(key);
            }

            count++;
        });

        stream.on('end', async () => {
            console.log(count)

            if (keyRanges.length === 0) {
                resolve(await getRandomKeyInRange(db, firstAddress, (await db.keys({gte: firstAddress}).all()).length));
            } else {
                // Step 2: Randomly pick a key range
                const randomRangeIndex = crypto.randomInt(0, keyRanges.length - 1);
                const startKey = keyRanges[randomRangeIndex];

                // Step 3: Perform a second random selection within this range
                try {
                    const randomKeyInRange = await getRandomKeyInRange(db, startKey, stepSize);
                    resolve(randomKeyInRange);
                } catch (err) {
                    reject(err);
                }
            }
        });

        stream.on('error', reject);
    });
}

async function getRandomKeyInRange(db: LevelDB, startKey: Uint, rangeSize: number): Promise<Uint> {
    // Create a stream starting at the randomly selected key range
    let count = 0;
    const randomOffset = crypto.randomInt(0, rangeSize);

    return new Promise((resolve, reject) => {
        let stream = db.createKeyStream({gte: startKey});

        stream.on('data', (key: Uint) => {
            // Stop when we reach the random offset within the selected range
            if (count === randomOffset) {
                resolve(key);
                stream.destroy();  // Stop the stream once the key is found
            }
            count++;
        });

        stream.on('end', () => reject(new Error("Could not find a key in range")));
        stream.on('error', reject);
    });
}

async function selectNextMinter(slot: Uint64, level: LevelDB): Promise<AddressHex> {

    // const slotHash = AddressHex.fromTypeAndBody(PX.A_0e, LCrypt.sha256(slot).slice(0, 20));

    // const address = new AddressHex(
    //     (await level.keys({gte: slotHash, limit: 1}).all())[0] ||
    //     (await level.keys({lte: slotHash, limit: 1}).all())[0]
    // );

    return new Promise((resolve, reject) => {

        const minterAddressesStream = level.createKeyStream({gte: AddressHex.fromTypeAndBody(PX.A_0c, Uint.from(0))});

        let count = Uint64.from(0);

        minterAddressesStream.on('data', (key: Uint) => {
            if (count.eq(slot)) {
                minterAddressesStream.destroy();
                resolve(new AddressHex(key));
            }
            count.iadd(1);
        });

    });
}

async function calulateResults(frequency: UintMap<Uint64>, slotsCount: number, prefixLength: number) {
    const expectedFrequency = slotsCount / 256 ** prefixLength;

    let totalDeviation = 0;
    let highestDeviation = 0;

    for (let [, count] of frequency) {
        const actualFreq = count.toInt();
        const deviation = Math.abs(actualFreq - expectedFrequency);
        totalDeviation += deviation;

        if (deviation > highestDeviation) {
            highestDeviation = deviation;
        }
    }

    console.log("Expected Frequency:", expectedFrequency);
    console.log("Highest Deviation:", highestDeviation);
}


async function testRandomness(level: LevelDB, slotsCount: number, prefixLength: number) {
    const addresses: AddressHex[] = [];
    
    const startTime = startTimer();

    for (let i = 0; i < slotsCount; i++) {
        addresses[i] = await selectNextMinter(Uint64.from(i), level);
    }

    const elapsedTime = endTimer(startTime);

    console.log(`Tested ${slotsCount} slots in ${elapsedTime.toFixed(1)}ms`);
    console.log(`Average time per slot: ${(elapsedTime / slotsCount).toFixed(2)}ms`);

    const frequency = new UintMap<Uint64>(addresses.map(address => [address.getBody().slice(0, prefixLength), Uint64.from(0)]));
    for (const address of addresses) {
        const prefix = address.getBody().slice(0, prefixLength);
        (frequency.get(prefix) as Uint64).iadd(1);
    }

    await calulateResults(frequency, slotsCount, prefixLength);
}

// async function testMathRandomness(minters: AddressHex[], slotsCount: number) {
//     const frequency = new UintMap<Uint64>(minters.map(address => [address.getBody().slice(1, prefixLength), Uint64.from(0)]));
//     for (const address of minters) {
//         const prefix = address.getBody().slice(1, prefixLength);
//         (frequency.get(prefix) as Uint64).iadd(1);
//     }

//     await calulateResults(frequency, slotsCount, prefixLength);


// }

async function main() {
    const mintersCount = 10_000_000;
    const slotsCount = 1;
    const prefixLength = 1;

    const level = await generateMinterDB(mintersCount);
    console.log("Generated minter database");

    console.log("Testing randomness of minter selection algorithm");
    await testRandomness(level, slotsCount, prefixLength);

    await level.close();
    //await LevelDBUtils.destroyDB("stake1");
}

await main();
