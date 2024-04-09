import crypto from "crypto";
import { sha256 } from "./randtest.js";
import { startTimer, endTimer } from "./testUtils.js"

const leiCoinAddress32Chars = '123456789abcdefghjklmnpqrstuvwyz';

function hexToAddress32(hexString) {
    let decimalValue = BigInt('0x' + hexString);
    let address32 = '';
    while (decimalValue > 0n) {
        address32 = leiCoinAddress32Chars[Number(decimalValue % 32n)] + address32;
        decimalValue = decimalValue / 32n;
    }
    return address32 || '0';
}

function address32ToHex(address32) {
    let decimalValue = 0n;
    for (let i = 0; i < address32.length; i++) {
        decimalValue = decimalValue * 32n + BigInt(leiCoinAddress32Chars.indexOf(address32[i]));
    }
    return decimalValue.toString(16);
}

function hexToAddress322(hex) {
    let binary = '';

    // Convert hex to binary
    for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substring(i, i + 2), 16);
        binary += byte.toString(2).padStart(8, '0');
    }

    // Pad binary to ensure it's a multiple of 5
    binary = binary.padEnd(Math.ceil(binary.length / 5) * 5, '0');

    let address32 = '';

    // Convert binary to base 32
    for (let i = 0; i < binary.length; i += 5) {
        const chunk = binary.substring(i, i + 5);
        const index = parseInt(chunk, 2);
        address32 += leiCoinAddress32Chars[index];
    }

    return address32;
}

function address32ToHex2(address32) {
    let binary = '';

    // Convert address32 to binary
    for (let i = 0; i < address32.length; i++) {
        const char = address32[i];
        const index = leiCoinAddress32Chars.indexOf(char);
        binary += index.toString(2).padStart(5, '0');
    }

    let hex = '';

    // Convert binary to hex
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.substring(i, i + 8);
        hex += parseInt(byte, 2).toString(16).padStart(2, '0');
    }

    return hex.substring(0, hex.length - 2);
}

function example() {
    const hexAddress = "00074e1c5a92b6b4d27967fc6abddee7dd58d6";
    const address32 = hexToAddress322(hexAddress);
    console.log('Encoded:', address32, address32.length);

    const hexDecoded = address32ToHex2(address32);
    console.log('Is Equal: ' + (hexDecoded === hexAddress));
}

function test1() {

    const hexAddress = "9f5aef25982c665fc5b16a3fed6f5f2ef923c2";

    const startTime = startTimer();

    for (let i = 0; i < 1_000; i++) {
        const address32 = hexToAddress32(hexAddress);
        const hexAddress1 = address32ToHex(address32);
    }

    const elapsedTime = endTimer(startTime);

    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

}

function test2() {

    let lengthAll = 0;
    let average_length = 0;
    let min_length = Infinity;
    let max_length = 0;

    let min_hex_length = Infinity;
    let max_hex_length = 0;

    for (let i = 1; i < 1_000_000; i++) {
        const orginalHex = crypto.randomBytes(19).toString("hex");
        const address32 = hexToAddress322(orginalHex);
        const length = address32.length;
        average_length = (lengthAll + length) / i;
        min_length = (length < min_length) ? length : min_length;
        max_length = (length > max_length) ? length : max_length;
        lengthAll += length;

        const hex = address32ToHex2(address32);
        const hexLength = hex.length;
        min_hex_length = (hexLength < min_hex_length) ? hexLength : min_hex_length;
        max_hex_length = (hexLength > max_hex_length) ? hexLength : max_hex_length;
        if (hexLength !== 38) {
            console.log("Invalid hex lengt: ", address32, orginalHex, orginalHex.length, hex, hex.length);
        }
    }

    console.log("Average:", average_length);
    console.log("Min:", min_length);
    console.log("Max:", max_length);
    console.log("Min Hex:", min_hex_length);
    console.log("Max Hex:", max_hex_length);

}


//test1();
//test2();
example();
