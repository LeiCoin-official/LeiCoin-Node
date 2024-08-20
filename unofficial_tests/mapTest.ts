import { UintMap } from "../src/binary/map.js";
import { Uint } from "../src/binary/uint.js";

function test1() {

    const map = new UintMap<Uint>();

    map.set(Uint.from("0x01020304"), Uint.from("0x01020304", "utf8"));
    console.log(map.get(Uint.from("0x01020304"))?.toHex());
}


test1();