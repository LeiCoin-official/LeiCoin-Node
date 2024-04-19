import { endTimer, startTimer } from "./testUtils.js";
import { sha256 } from "./cryptoUtils.js"
import BN from "bn.js"

async function testbinaryMath1() {

    let myNum = Buffer.from(Math.floor(Math.random() * 1_000_000).toString(16), "hex");

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {

        let encoded = parseInt(`0x${myNum.toString("hex")}`);

        encoded = encoded * -i;

        myNum = Buffer.from(encoded.toString(16), "hex");
    }    

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

async function testbinaryMath2() {

    let myNum = Math.floor(Math.random() * 1_000_000);

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {
        
        myNum = myNum * -i;

    }    


    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}


async function testbinaryMath() {
    binary();
    normal();
}

class Bytes32 extends Uint8Array {

    constructor() {

    }

}

//console.log(sha256(new BN("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa", "hex").toBuffer()));
//console.log(sha256(Buffer.from("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa", "hex")));

console.log(new BN("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa", "hex").toString());

console.log(new Uint8Array([0x10, 0x10]))

const array = new Uint8Array(4);
array.set([0x11, 0x11], 1)
console.log(array)
