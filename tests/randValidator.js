import crypto from 'crypto';
import { shuffleArray, shuffleObject, sha256, getNextValidator, calculateNextValidators } from './randtest.js';
import { startTimer, endTimer } from "./testUtils.js"

function one() {

    const inputString = sha256(crypto.randomBytes(32).toString('hex'));

    const objectToSort = {};
    
    for (let i = 0; i < 1000000; i++) {
        objectToSort[i] = ("lc0x" + crypto.randomBytes(19).toString('hex'));
    }
    
    const shuffledArray = shuffleArray(arrayToSort)
    
    const startTime = startTimer();
    
    const r1 = getNextValidator(inputString, arrayToSort);
    
    const elapsedTime = endTimer(startTime);
    
    const r2 = getNextValidator(inputString, shuffledArray);
    
    console.log(inputString);
    console.log(r1);
    console.log(r1 === r2);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

function two() {
    
    const inputString = sha256(crypto.randomBytes(32).toString('hex'));

    const objectToSort = {};

    for (let i = 0; i < 1_000_000; i++) {
        objectToSort["lc0x" + crypto.randomBytes(19).toString('hex')] = {stake: "32"};
    }

    globalThis.stakers = objectToSort;

    const shuffledobjectToSort = shuffleObject(objectToSort);

    const startTime = startTimer();

    const r1 = calculateNextValidators(inputString);

    const elapsedTime = endTimer(startTime);

    globalThis.stakers = shuffledobjectToSort;

    const r2 = calculateNextValidators(inputString);

    console.log(inputString);
    console.log(r1);
    console.log(JSON.stringify(r1) === JSON.stringify(r2));
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

function three() {


    const objectToSort = {};

    for (let i = 0; i < 1_000_000; i++) {
        objectToSort["lc0x" + crypto.randomBytes(19).toString('hex')] = {stake: "32"};
    }

    const startTime = startTimer();

    const r1 = Object.keys(objectToSort).sort();

    const elapsedTime = endTimer(startTime);

    console.log(r1);

    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

three();

