import { Uint } from "../build/src/utils/binary.js";
import BMap from "../build/src/utils/binmap.js";

const db = new BMap();
const ddb = new Map();

db.set(Uint.from("f0"), "ab");
db.set(Uint.from("a1"), "cd");

//ddb.set(Uint.from("f0"), "ab");
//ddb.set(Uint.from("a1"), "cd");

ddb.set(Uint.from("f0").getAB(), "ab");
ddb.set(Uint.from("a1").getAB(), "cd");

//console.log(db.get(Uint.from("f0")));
//console.log(db.get(Uint.from("a1")));

console.log(ddb.get(Uint.from("f0").getAB()));
console.log(ddb.get(Uint.from("a1").getAB()));

//console.log(ddb.get(Uint.from("f0")));

/*for (const key of db.keys()) {
    console.log(key);
}*/

/*const iterator = db[Symbol.iterator]();
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());*/

/*
const iterator2 = ddb[Symbol.iterator]();
console.log(iterator2.next());
console.log(iterator2.next());
console.log(iterator2.next());
*/

