import { endTimer, startTimer } from "./testUtils.js";

async function binary() {

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

async function normal() {

    let myNum = Math.floor(Math.random() * 1_000_000);

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {
        
        myNum = myNum * -i;

    }    


    const elapsedTime = endTimer(startTime);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

(async function (){

    binary();
    normal();

})();

