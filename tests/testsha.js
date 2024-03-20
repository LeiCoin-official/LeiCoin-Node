import { startTimer, endTimer } from "./testUtils.js";
import cryptoHandlers from "../build/src/handlers/cryptoHandlers.js"
import crypto from "crypto";

const obj = {};

for (let i = 0; i < 10_000; i++) {
	obj[("lc0x" + crypto.randomBytes(19).toString("hex"))] = i;
}

console.log("startTimer");

const startTime = startTimer();

for (let i = 0; i < 10; i++) {
    cryptoHandlers.sha256(obj);
}

const elapsedTime = endTimer(startTime);
console.log("Elapsed time:", elapsedTime / 1000, "seconds");

