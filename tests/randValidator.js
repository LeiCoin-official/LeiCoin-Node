import crypto from 'crypto';
import { startTimer, endTimer, shuffleArray, sha256, getNextValidator } from './randtest.js';


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