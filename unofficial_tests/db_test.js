import { Level } from "level";
import LevelDB from "../build/src/storage/leveldb.js";
import crypto from 'crypto';
import { shuffleArray } from './cryptoUtils.js';
import { startTimer, endTimer } from "./testUtils.js";
import { Uint, Uint256, Uint64 } from "../build/src/utils/binary.js";
import { AddressHex } from "../build/src/objects/address.js";
import Crypto from "../build/src/crypto/index.js";
import { PX } from "../build/src/objects/prefix.js";
import * as levelDBUtils from "./leveldb_utils.js";
import { Validator } from "./smart-contract-db.js"

/** @typedef {"stake1" | "stake2" | "stake3" | "stake4"} DBs */

async function speedTest(db1 = "stake1", db2) {

    const level1 = new LevelDB(levelDBUtils.getDBPath(db1));

    /** @type {(level: LevelDB) => Promise<number>} */
    async function doTest(level) {
        await level.open();
        const startTime = startTimer();
        const keys = await level.keys().all();
        const elapsedTime = endTimer(startTime);

        //console.log(await level.get(keys[2]));
        //console.log(Validator.fromDecodedHex(await level.get(keys[2])));

        //const address = "9a19f035c1862f331fb2b0ed8e418818f9dfa16e";
        //const validator = Validator.fromDecodedHex((await level.values({gte: Uint.from(address), limit: 1}).all())[0]);
        //console.log(validator.address.toHex());
        
        level.close();
        return elapsedTime;
    };

    const time1 = await doTest(level1);

    console.log("Elapsed time 1:", time1 / 1000, "seconds");

    if (db2) {
        const level2 = new Level(getDBPath(db2), {keyEncoding: "hex", valueEncoding: "hex"});
        const time2 = await doTest(level2);
        console.log("Elapsed time 2:", time2 / 1000, "seconds");
        console.log("DB working with Uint is", (time1 / time2), "times faster then with strings");
    }
}


async function gen_old(size, db1 = "stake1", db2 = "stake2") {

    const level1 = await levelDBUtils.openDB(db1);
    const level2 = await levelDBUtils.openDB(db2);

    const hashes = [];

    const emptyUint = Uint.from("00")

    for (let i = 0; i < size; i++) {
        hashes.push(Uint.create(crypto.randomBytes(32)));
    }

    const shuffledHashes = shuffleArray(hashes);

    for (let i = 0; i < size; i++) {
        await Promise.all([
            level1.put(hashes[i], emptyUint),
            level2.put(shuffledHashes[i], emptyUint)
        ]);
    }

    await level1.close();
    await level2.close();
}
async function gen(size, db = "stake1") {

    const level = await levelDBUtils.openDB(db);
    
    const validator_preifx = PX.A_0e;
    const metaDataPrefix = PX.META;

    const promises = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(
                Uint.concat([
                    validator_preifx,
                    Uint.from(i)
                ]),
                Uint.concat([
                    // Withdraw Address
                    new AddressHex(crypto.randomBytes(21)).getBody(),

                    // Stake Amount
                    Uint64.from(32_0000_0000)
                ])
            )
        );
    }

    //& length
    await level.put(Uint.concat([metaDataPrefix, Uint.from("00ed")]), Uint.from(size));

    await Promise.all(promises);
    await level.close();
}

/** @type {(db: DBs, seedHash: Uint256) => Promise<[Uint[], number, boolean]>} */
async function selectNextValidators_old(db, seedHash) {
    const level = await levelDBUtils.openDB(db);

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
    await level.close();
    return [validators, elapsedTime, using_first_validators];
}

/** @type {(db: DBs, seedHash: Uint256) => Promise<[import('../build/src/utils/objects.js').Dict<Uint>, number, boolean]>} */
async function selectNextValidators(db, seedHash) {
    const level = await levelDBUtils.openDB(db);

    let using_first_validators = false;

    let elapsedTime;
    const startTime = startTimer();

    const validators = {};
    const validators_count = await level.get(Uint.from("ff00ed"));
    const validator_preifx = PX.A_0e;

    if (validators_count.lte(128)) {
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
    await level.close();
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

    //const time1 = await test1("stake1", selectNextValidators_old, true);
    const time2 = await test1("stake3", selectNextValidators, true);

    //console.log("Elapsed average time 1:", time1 / 1000 / 10, "seconds");
    console.log("Elapsed average time 2:", time2 / 1000 / 10, "seconds");
    //console.log("New Selecting is", time1 / time2, "times faster then the old method");

}

async function test2(db1 = "stake1", db2 = "stake2", func = selectNextValidators, seedHash = Crypto.sha256(crypto.randomBytes(32))) {
    
    const results = [
        await func(db1, seedHash),
        await func(db2, seedHash)
    ];

    for (const [index, result] of results.entries()) {
        console.log(`Results for DB ${index + 1}`);
        //console.log(result[0]);
        console.log("  Elapsed time:", result[1] / 1000, "seconds");
        console.log(result[2] ? "  Using first 128 validators" : "  Using selected validators");
    }

    console.log("Result is the same:", results[0][0].toString() === results[1][0].toString());

}

async function test3(db = "stake1", func = selectNextValidators_old, seedHash = Crypto.sha256(crypto.randomBytes(32))) {
    
    const result = await func(db, seedHash);
    const temp = [];
    let noDuplicates = true;

    for (const validator of result[0]) {
        noDuplicates = noDuplicates && !(temp.some(item => item.eq(validator)));
        temp.push(validator);
    }

    console.log(noDuplicates);

}


//gen_old(129);
//gen(129, "stake3");
//gen_old(100_000);
//gen(1_000_000, "stake3")

//await gen();

//speedTest("stake3", null);

//test2("stake1", "stake2");
//test2("stake3", "stake4");

//test1("stake3");

//fastestSelectNextValidators();

/*
(async() => {

    let uint;
    let uint1 = Uint.from("abcdef");
    let uint2 = Uint.from("012345");

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {
        uint = Uint.concat([uint1, uint2]);
    }

    const elapsedTime = endTimer(startTime);
    console.log(uint);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

})();
*/

//test1("stake1", selectNextValidators_old);
test2("stake1", "stake2", selectNextValidators_old);
//test3();
