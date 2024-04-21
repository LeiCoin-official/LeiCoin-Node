import { endTimer, startTimer } from "./testUtils.js";
import { sha256 } from "./cryptoUtils.js"
import BN from "bn.js"
import crypto from "crypto";

//console.log(process.memoryUsage().heapUsed)

// Get the memory usage of myVariable
//const memoryUsage = getMemoryUsage(myVariable);
//console.log("Memory usage of myVariable:", memoryUsage, "bytes");

//const onStart = process.memoryUsage().heapUsed;
/*console.log(process.memoryUsage().arrayBuffers - 139624);
console.log(process.memoryUsage().heapUsed - 6495880);
//const a = new Uint8Array(2000);
const a = new Array(2000).fill(0);
//let a = undefined;
//const a = Buffer.alloc(2000);
//console.log(process.memoryUsage().heapUsed - onStart);
console.log(process.memoryUsage().arrayBuffers - 139624);
console.log(process.memoryUsage().heapUsed - 6495880);

setTimeout(() => {console.log(a)}, 1000000)
*/

class BytesUtils {
    static fromHexArray(input, CLS) {
        const bytes = new CLS(input.length);
        for (const [i, item] of input.entries()) {
            bytes[i] = parseInt(item, 16);
        }
        return bytes;
    }
    static fromHex(input, CLS) {
        return Buffer.from(input, "hex");
    }
    static from(input, enc) {
        switch (enc) {
        }
    }
}
BytesUtils.encodingsOperations = {
    hex: {},
    bigint: {},
    number: {},
    array: {}
};
class Bytes extends Uint8Array {
    constructor(arrayORlength) {
        super(arrayORlength);
    }
    static new(arrayORlength) {
        return new Bytes(arrayORlength);
    }
    static alloc(length) {
        return new Bytes(length);
    }
    static from(arrayLike, enc) {
        //return new Bytes(base);
        return new Uint8Array(1);
    }
}
class Bytes32 extends Bytes {
    constructor(array) {
        if (array) {
            super(array);
        }
        else {
            super(32);
        }
    }
    static alloc() {
        return new Bytes32();
    }
}


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




async function test1() {

    let bool = true;

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {
        
        const randomBytes = crypto.randomBytes(32).toString("hex");

        bool = bool && (Buffer.from(BytesUtils.fromHex(randomBytes, Bytes32)).toString("hex") === randomBytes);

    }    


    const elapsedTime = endTimer(startTime);
    console.log(bool);
    console.log("Elapsed time 1:", elapsedTime / 1000, "seconds");

}

async function test2_1() {

    let bytes = "";

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {
        bytes = BytesUtils.fromHex("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa", Buffer);
    }

    console.log(bytes);

    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time 2_1:", elapsedTime / 1000, "seconds");

}

async function test2_2() {

    let bytes = "";

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {
        bytes = Buffer.from("c2c53b8c95f84438d86ccabd9985651afdf8fe1307f691681f9638ff04bf9caa", "hex")
    }

    console.log(bytes);
    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time 2_1:", elapsedTime / 1000, "seconds");

}

async function testMain() {
    //test1();
    test2_1();
    test2_2();
}

testMain();
