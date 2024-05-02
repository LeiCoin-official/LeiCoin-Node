import { Level } from "level";
import LevelDB from "../build/src/storage/leveldb.js";
import crypto from 'crypto';
import path from "path";
import { shuffleArray } from './cryptoUtils.js';
import { startTimer, endTimer } from "./testUtils.js";
import { Uint, Uint256, Uint64 } from "../build/src/utils/binary.js";
import Crypto from "../build/src/crypto/index.js";
import { PX } from "../build/src/objects/prefix.js";

/** @type {(db: "stake1" | "stake2") => string} */
function getDBPath(db) {
    return path.join(process.cwd(), "/blockchain_data", `/tests/${db}`);
}

/** @type {(db: "stake1" | "stake2") => Promise<LevelDB<Uint, Uint>>} */
async function openDB(db) {
    const level = new LevelDB(getDBPath(db));
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
    
    const preifx = PX.A_0e;
    const metaDataPrefix = PX.META;

    const promises = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(Uint.concat(preifx, Uint.from(i)), Uint.create(crypto.randomBytes(32)))
        );
    }

    //& length
    level.put(Uint.concat(metaDataPrefix, Uint.from("00ed")), Uint.from(size));

    await Promise.all(promises);

}

/** @type {(db: "stake1" | "stake2", seedHash: Uint256) => Promise<[Uint[], number, boolean]>} */
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

/** @type {(db: "stake1" | "stake2", seedHash: Uint256) => Promise<[Uint[], number, boolean]>} */
async function selectNextValidators(db, seedHash) {
    const level = await openDB(db);

    let using_first_validators = false;

    let elapsedTime;
    const startTime = startTimer();

    let validators = {};
    let validators_count = await level.get(Uint.from("ff00ed"));

    if (validators_count.lte(128)) {
        using_first_validators = true;
        for await (const [index, data] of level.iterator()) {
            if (index.slice(0, 1).eq(PX.META)) continue;
            validators[index.slice(1)] = data;
        }
    } else {
        let nextIndex = BigInt(seedHash.toHex()) % BigInt();
        let takenIndexes = []

        while (validators.length !== 128) {

            let winner = await level.get()
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

async function test1(db = "stake1") {
    let nextHash = Crypto.sha256(crypto.randomBytes(32));
    
    const startTime = startTimer();

    for (let i = 0; i < 10; i++) {
        await selectNextValidators(db, nextHash);
        nextHash = Crypto.sha256(crypto.randomBytes(32));
    }

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time:", elapsedTime / 1000 / 10, "seconds");
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


//gen(129);
//gen(129, "stake3");
//gen(100_000, "stake3", "stake4");

//await gen();

//speedTest();

//test2("stake1", "stake2");
//test2("stake3", "stake4");

test1("stake3");
