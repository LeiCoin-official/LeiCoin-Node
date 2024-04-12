import { Level } from "level";
import crypto from 'crypto';
import path from "path";
import { sha256, shuffleArray } from './randtest.js';
import { startTimer, endTimer } from "./testUtils.js";

async function gen(size = 1_000_000) {

    const level1 = new Level(path.join(process.cwd(), "/blockchain_data", "/tests/stake1"), {keyEncoding: "hex", valueEncoding: "hex"});
    const level2 = new Level(path.join(process.cwd(), "/blockchain_data", "/tests/stake2"), {keyEncoding: "hex", valueEncoding: "hex"});

    const hashes = [];

    for (let i = 0; i < size; i++) {
        hashes.push(crypto.randomBytes(32).toString('hex'));
    }

    const shuffledHashes = shuffleArray(hashes);

    const promises = [];

    for (let i = 0; i < size; i++) {
        promises.push(level1.put(hashes[i] ,"00"));
        promises.push(level2.put(shuffledHashes[i] ,"00"));
    }

    await Promise.all(promises);

}

async function test1() {

    const level1 = new Level(path.join(process.cwd(), "/blockchain_data", "/tests/stake1"), {keyEncoding: "hex", valueEncoding: "hex"});
    const level2 = new Level(path.join(process.cwd(), "/blockchain_data", "/tests/stake2"), {keyEncoding: "hex", valueEncoding: "hex"});

    const seedHash = sha256(crypto.randomBytes(32).toString('hex'));

    const startTime = startTimer();

    const winner1 = (await level1.keys({gte: seedHash, limit: 1}).all())[0];

    const elapsedTime = endTimer(startTime);

    const winner2 = (await level2.keys({gte: seedHash, limit: 1}).all())[0];

    console.log(seedHash)
    console.log(winner1, winner2);
    console.log(winner1 === winner2);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

async function test2(db = "stake1", seedHash = sha256(crypto.randomBytes(32).toString('hex'))) {

    const level = new Level(path.join(process.cwd(), "/blockchain_data", `/tests/${db}`), {keyEncoding: "hex", valueEncoding: "hex"});

    const startTime = startTimer();

    let next_validators;

    const first_validators = await level.keys({limit: 129}).all();

    if (first_validators.length <= 128) {
        next_validators = first_validators;
        console.log("Using first validators");

    } else {

        const selected_validators = [];

        let nextHash = seedHash;

        for (let i = 0; i < 128; i++) {

            while (selected_validators.length !== 128) {

                const keyIteratorOptions = (parseInt(nextHash.substring(0, 1), 16) % 2 === 0) ? {gte: nextHash, limit: 1} : {lte: nextHash, limit: 1, reverse: true};

                let winner = (await level.keys(keyIteratorOptions).all())[0];
                if (!selected_validators.includes(winner)) {
                    selected_validators.push(winner);
                }

                nextHash = sha256(nextHash);

            } 

        }

        next_validators = selected_validators;
        console.log("Using selected validators");

    }


    const elapsedTime = endTimer(startTime);

    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

    return next_validators;

}

async function test3(db = "stake1") {

    const level = new Level(path.join(process.cwd(), "/blockchain_data", `/tests/${db}`), {keyEncoding: "hex", valueEncoding: "hex"});

    const startTime = startTimer();

    const first_validators = await level.keys().all();

    const elapsedTime = endTimer(startTime);

    console.log(first_validators);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

    return first_validators;

}

async function main() {

    //gen(128);
    //gen(129);

    //await gen();

    console.log((await test2("stake1", "3f33455e1f6746f821d730a55cee7e0054c318ae9f6b151d257bac1a9f6c5470")).toString() === (await test2("stake2", "3f33455e1f6746f821d730a55cee7e0054c318ae9f6b151d257bac1a9f6c5470")).toString());

    //test3();

}

main();