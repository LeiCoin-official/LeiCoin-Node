import crypto from "crypto";
import { startTimer, endTimer, SpecialObject } from "./randtest.js";
import fs from "fs";

/*
async function two() {

	const promises = [];

	const nobj = {};

    async function insert(i) {
        nobj["lc0x" + crypto.randomBytes(19).toString("hex")] = i;
    }

	const startTime2 = startTimer();

	for (let i = 0; i < 1_000_000; i++) {
		promises.push(insert(i));
		//console.log(i);
	}

	await Promise.all(promises);

	const elapsedTime2 = endTimer(startTime2);

	console.log("Elapsed time 2:", elapsedTime2 / 1000, "seconds");

    fs.writeFileSync("./tests/two.json", JSON.stringify(nobj));
}

async function one() {
	const promises = [];

	const specialObj = new SpecialObject();

    async function insert(i) {
        specialObj.insert(
            i * 4,
            "lc0x" + crypto.randomBytes(19).toString("hex"),
        );
    }

	const startTime = startTimer();

	for (let i = 0; i < 1_000_000; i++) {
		promises.push(insert(i));
		//console.log(i);
	}

	//specialObj.insert(1_000_001, "lc0x" + crypto.randomBytes(19).toString("hex"));

	await Promise.all(promises);

	const elapsedTime = endTimer(startTime);

	console.log("Elapsed time 1:", elapsedTime / 1000, "seconds");

    fs.writeFileSync("./tests/one.json", JSON.stringify(specialObj.data));
  
}

one();
two();
*/

function sortObjectAlphabetical(obj) {
    const deepSort = (input) => {
        if (typeof input !== 'object' || input === null) {
            return input;
        }

        if (Array.isArray(input)) {
            return input.map(deepSort);
        }

        const sortedObj = {};
        Object.keys(input)
            .sort()
            .forEach(key => {
                sortedObj[key] = deepSort(input[key]);
            });
        return sortedObj;
    };

    const sortedObj = deepSort(obj);
    return sortedObj;
}

const obj = {};

const startTime1 = startTimer();

for (let i = 0; i < 1_000_000; i++) {
	obj[("lc0x" + crypto.randomBytes(19).toString("hex"))] = i;
}

const elapsedTime1 = endTimer(startTime1);


const startTime2 = startTimer();

const sortedObj = sortObjectAlphabetical(obj);
const arrayObj = Object.entries(sortedObj);

const elapsedTime2 = endTimer(startTime2);

//specialObj.insert(1_000_001, "lc0x" + crypto.randomBytes(19).toString("hex"));


console.log(arrayObj[Math.floor(Math.random()*arrayObj.length)])

console.log("Elapsed time 1:", elapsedTime1 / 1000, "seconds");
console.log("Elapsed time 2:", elapsedTime2 / 1000, "seconds");

fs.writeFileSync("./tests/one.json", JSON.stringify(sortedObj));
  
