import crypto from 'crypto';
import findMostSimilarString from './randtest.js';

function startTimer() {
    return performance.now();
}

function endTimer(startTime) {
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    return elapsedTime; // Return the elapsed time in milliseconds
}

function sha256(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const inputString = sha256(crypto.randomBytes(32).toString('hex'));

const arrayToSort = [];

for (let i = 0; i < 1000000; i++) {
    arrayToSort.push("lc0x" + crypto.randomBytes(19).toString('hex'));
}

const shuffledArray = shuffleArray(arrayToSort)

const startTime = startTimer();

const r1 = findMostSimilarString(inputString, arrayToSort);

const elapsedTime = endTimer(startTime);

const r2 = findMostSimilarString(inputString, shuffledArray);

console.log(r1);

console.log(r1 === r2);

console.log("Elapsed time:", elapsedTime / 1000, "seconds");