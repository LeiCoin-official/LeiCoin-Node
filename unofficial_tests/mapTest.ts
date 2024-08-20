import { encode } from "querystring";

function test1() {
    /*
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
}

function test2() {

    const set = new <Array<number>, string>();

    //const buf1 = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    //const buf2 = Buffer.from([0x01, 0x02, 0x03, 0x04]);

    const array1 = [0x01, 0x02, 0x03, 0x04];
    const array2 = [0x01, 0x02, 0x03, 0x04];

    map.set(array1, "ab");
    console.log(map.get(array1));
    encode()
}

test2();


