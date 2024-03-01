import { Level } from "level";
import path from "path";

function stringToHex(stringData: string) {
  return Buffer.from(stringData).toString("hex");
}

function hexToString(hexData: string) {
    return Buffer.from(hexData, "hex").toString();
}

function encodeAddressToHexKey(address: string) {
	return address.slice(2, address.length).replace("x", "0");
}

function decodeHexKeyToAddress(hexKey: string) {
	const splitetHexKey = hexKey.split("");
   	splitetHexKey[1] = splitetHexKey[1].replace("0", "x");
   	const address = "lc" + splitetHexKey.join("");
   	return address;
}

const address = "0001da74f8d1cf98760388643407cd1d4bc19f28";
const myhex = "7b0001da74f8d1cf98760388643407cd1d4bc19f287d";


console.log(hexToString(myhex).split(hexToString()))

async function main() {

    const utxosIndex = new Level(path.join(process.cwd(), "/blockchain_data/utxos"), {keyEncoding: "hex", valueEncoding: "hex"});

}

/*

how the utxo database should work:

keys:

my address: lc0x01da74f8d1cf98760388643407cd1d4bc19f28

remove lc prefix and convert the x to 0:
0001da74f8d1cf98760388643407cd1d4bc19f28
<><------------------------------------>
version        address

this data is now the encoded hex data thats used for the key.

values:



*/

//main();

/*
function calculateEfficienty(wallets: number, utxos_per_wallet: number) {

    const hash = 32;
    const height = 6;
    const amount = 6;
    const seperator = 1;
    const address = 20;
    const utxos_per_transaction = 2;
    const transactions = (wallets * utxos_per_wallet) / utxos_per_transaction;

    const needWhenAdressBased = (address + ((seperator + hash + height + seperator + amount + seperator) * utxos_per_wallet)) * wallets;

    const needWhenCTBasedBasic = (hash + (7 + ((address + seperator + amount) * utxos_per_transaction))) * transactions;

    //const needWhenCTBasedIndex = (address + ((hash + height) * utxos_per_wallet)) * wallets;

    console.log("needWhenAdressBased", needWhenAdressBased / 1024 / 1024 / 1024);

    console.log("needWhenCTBasedBasic", needWhenCTBasedBasic / 1024 / 1024 / 1024);

    //console.log("needWhenCTBasedBasic + needWhenCTBasedIndex", needWhenCTBasedBasic + needWhenCTBasedIndex);

    // one million utxos
    //console.log(((seperator + hash + height + seperator + amount + seperator) * 1000000) / 1024 / 1024)


}

calculateEfficienty(100000000, 10);
*/