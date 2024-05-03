import { Level } from "level";
import LevelDB from "../build/src/storage/leveldb.js";
import crypto from 'crypto';
import path from "path";
import { shuffleArray } from './cryptoUtils.js';
import { startTimer, endTimer } from "./testUtils.js";
import { Uint, Uint256, Uint64 } from "../build/src/utils/binary.js";
import Crypto from "../build/src/crypto/index.js";
import { PX } from "../build/src/objects/prefix.js";

/** @typedef {"stake1" | "stake2" | "stake3" | "stake4"} DBs */

/** @type {(db: DBs) => string} */
function getDBPath(db) {
    return path.join(process.cwd(), "/blockchain_data", `/tests/${db}`);
}

/** @type {(db: DBs) => Promise<LevelDB<Uint, Uint>>} */
async function openDB(db) {
    const level = new LevelDB(getDBPath(db));
    //const level = new LevelDB(getDBPath(db), {keyEncoding: "bu", valueEncoding: "binary"});
    await level.open();
    return level;
}

async function speedTest() {

    const level1 = new Level(getDBPath("stake1"), {keyEncoding: "hex", valueEncoding: "hex"});
    const level2 = new LevelDB(getDBPath("stake2"));

    async function doTest(level) {
        await level.open();
        const startTime = startTimer();
        const keys = await level.keys().all();
        const elapsedTime = endTimer(startTime);
        level.close();
        return elapsedTime;
    };

    const time1 = await doTest(level1);
    const time2 = await doTest(level2);

    console.log("Elapsed time 1:", time1 / 1000, "seconds");
    console.log("Elapsed time 2:", time2 / 1000, "seconds");
    console.log("DB working with Uint is", (time1 / time2), "times faster then with strings");
}


async function gen_old(size, db1 = "stake1", db2 = "stake2") {

    const level1 = await openDB(db1);
    const level2 = await openDB(db2);

    const hashes = [];

    const emptyUint = Uint.from("00")

    for (let i = 0; i < size; i++) {
        hashes.push(Uint.create(crypto.randomBytes(32)));
    }

    const shuffledHashes = shuffleArray(hashes);

    const promises = [];

    for (let i = 0; i < size; i++) {
        promises.push(level1.put(hashes[i], emptyUint));
        promises.push(level2.put(shuffledHashes[i], emptyUint));
    }

    await Promise.all(promises);

}
async function gen(size, db = "stake1") {

    const level = await openDB(db);
    
    const validator_preifx = PX.A_0e;
    const metaDataPrefix = PX.META;

    const promises = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(Uint.concat([validator_preifx, Uint.from(i)]), Uint.create(crypto.randomBytes(32)))
        );
    }

    //& length
    level.put(Uint.concat([metaDataPrefix, Uint.from("00ed")]), Uint.from(size));

    await Promise.all(promises);

}

/** @type {(db: DBs, seedHash: Uint256) => Promise<[Uint[], number, boolean]>} */
async function selectNextValidators_old(db, seedHash) {
    const level = await openDB(db);

    let using_first_validators = false;

    let elapsedTime;
    const startTime = startTimer();

    let validators = await level.keys({limit: 129}).all();
    if (validators.length <= 128) {
        using_first_validators = true;
    } else {
        validators = [];
        let nextHash = seedHash;

        while (validators.length !== 128) {
            let winner = (
                (await level.keys({gte: nextHash, limit: 1}).all())[0] ||
                (await level.keys({lte: nextHash, limit: 1, reverse: true}).all())[0]
            );
            if (!validators.some(item => item.eq(winner))) {
                validators.push(winner);
            }
            nextHash = Crypto.sha256(nextHash);
        }
        elapsedTime = endTimer(startTime);
    }
    elapsedTime = endTimer(startTime);
    level.close();
    return [validators, elapsedTime, using_first_validators];
}

/** @type {(db: DBs, seedHash: Uint256) => Promise<[Uint[], number, boolean]>} */
async function selectNextValidators(db, seedHash) {
    const level = await openDB(db);

    let using_first_validators = false;

    let elapsedTime;
    const startTime = startTimer();

    const validators = {};
    const validators_count = await level.get(Uint.from("ff00ed"));
    const validator_preifx = PX.A_0e;

    if (validators_count.lte(129)) {
        using_first_validators = true;
        for await (const [index, data] of level.iterator()) {
            if (index.slice(0, 1).eq(PX.META)) continue;
            validators[index.slice(1).toInt()] = data;
        }
    } else {
        let nextHash = seedHash;
        const takenIndexes = [];

        while (takenIndexes.length !== 128) {
            let nextIndex = nextHash.mod(validators_count);

            if (!takenIndexes.includes(nextIndex)) {
                takenIndexes.push(nextIndex);

                const validator_index = Uint.from(nextIndex);

                const validator_data = await level.get(Uint.concat([validator_preifx, validator_index]));
                validators[nextIndex] = validator_data;
            }
            nextHash = Crypto.sha256(Uint.concat([nextHash, seedHash]));
        }
        elapsedTime = endTimer(startTime);
    }
    elapsedTime = endTimer(startTime);
    level.close();
    return [validators, elapsedTime, using_first_validators];
}

async function test1(db = "stake1", func = selectNextValidators, returnTime = false) {
    let nextHash = Crypto.sha256(crypto.randomBytes(32));
    
    const startTime = startTimer();

    for (let i = 0; i < 10; i++) {
        await func(db, nextHash);
        nextHash = Crypto.sha256(crypto.randomBytes(32));
    }

    const elapsedTime = endTimer(startTime);
    if (returnTime) {
        return elapsedTime;
    }
    console.log("Elapsed average time:", elapsedTime / 1000 / 10, "seconds");
}

async function fastestSelectNextValidators() {

    const time1 = test1("stake1", selectNextValidators_old);
    const time2 = test1("stake3", selectNextValidators);

    await Promise.all([time1, time2]);

    console.log("Elapsed average time:", time1 / 1000 / 10, "seconds");
    console.log("Elapsed average time:", time2 / 1000 / 10, "seconds");
    console.log("New Selecting is", time1 / time2, "times faster then DB 2");

}

async function test2(seedHash = Crypto.sha256(crypto.randomBytes(32)), db1 = "stake1", db2 = "stake2") {
    
    const results = [
        await selectNextValidators(db1, seedHash),
        await selectNextValidators(db2, seedHash)
    ];

    for (const [index, result] of results.entries()) {
        console.log(`Results for DB ${index + 1}`);
        //console.log(result[0]);
        console.log("  Elapsed time:", result[1] / 1000, "seconds");
        console.log(result[2] ? "  Using first 128 validators" : "  Using selected validators");
    }

    console.log("Result is the same:", results[0][0].toString() === results[1][0].toString());

}


//gen_old(129);
//gen(129, "stake3");
//gen(100_000, "stake3", "stake4");

//await gen();

//speedTest();

//test2("stake1", "stake2");
//test2("stake3", "stake4");

//test1("stake3");
selectNextValidators("stake3", new Uint256(crypto.randomBytes(32)))