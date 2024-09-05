import { ClassicLevel } from "classic-level";
import LevelDB from "../src/storage/leveldb/index.js";
import { shuffleArray } from './cryptoUtils.js';
import { startTimer, endTimer } from "./testUtils.js";
import { Uint, Uint256, Uint64 } from "../src/binary/uint.js";
import { UintMap } from "../src/binary/map.js";
import { AddressHex } from "../src/objects/address.js";
import { LCrypt } from "../src/crypto/index.js";
import { PX } from "../src/objects/prefix.js";
import { LevelDBUtils } from "./leveldb_utils.js";
import { Dict } from "../src/utils/dataUtils.js";

async function speedTest(db1: LevelDBUtils.DBs = "stake1", db2?: LevelDBUtils.DBs) {

    const level1 = new LevelDB(LevelDBUtils.getDBPath(db1));

    async function doTest(level: ClassicLevel | LevelDB) {
        await level.open();
        const startTime = startTimer();
        const keys = await level.keys().all();
        const elapsedTime = endTimer(startTime);

        //console.log(await level.get(keys[2]));
        //console.log(Validator.fromDecodedHex(await level.get(keys[2])));

        //const address = "9a19f035c1862f331fb2b0ed8e418818f9dfa16e";
        //const validator = Validator.fromDecodedHex((await level.values({gte: Uint.from(address), limit: 1}).all())[0]);
        //console.log(validator.address.toHex());
        
        level.close();
        return elapsedTime;
    };

    const time1 = await doTest(level1);

    console.log("Elapsed time 1:", time1 / 1000, "seconds");

    if (db2) {
        const level2 = new ClassicLevel(LevelDBUtils.getDBPath(db2), {keyEncoding: "hex", valueEncoding: "hex"});
        const time2 = await doTest(level2);
        console.log("Elapsed time 2:", time2 / 1000, "seconds");
        console.log("DB working with Uint is", (time1 / time2), "times faster then with strings");
    }
}


async function gen_old(size: number, db1: LevelDBUtils.DBs = "stake1", db2: LevelDBUtils.DBs = "stake2") {

    const level1 = await LevelDBUtils.openDB(db1);
    const level2 = await LevelDBUtils.openDB(db2);

    const hashes: Uint256[] = [];

    const emptyUint = Uint.from("00")

    for (let i = 0; i < size; i++) {
        hashes.push(new Uint256(LCrypt.randomBytes(32)));
    }

    const shuffledHashes = shuffleArray(hashes);

    for (let i = 0; i < size; i++) {
        await Promise.all([
            level1.put(hashes[i], emptyUint),
            level2.put(shuffledHashes[i], emptyUint)
        ]);
    }

    await level1.close();
    await level2.close();
}
async function gen(size: number, db: LevelDBUtils.DBs = "stake1") {

    const level = await LevelDBUtils.openDB(db);
    
    const validator_preifx = PX.A_0e;
    const metaDataPrefix = PX.META;

    const promises: Promise<void>[] = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(
                Uint.concat([
                    validator_preifx,
                    Uint.from(i)
                ]),
                Uint.concat([
                    // Withdraw Address
                    new AddressHex(LCrypt.randomBytes(21)).getBody(),

                    // Stake Amount
                    Uint64.from(32_0000_0000)
                ])
            )
        );
    }

    //& length
    await level.put(Uint.concat([metaDataPrefix, Uint.from("00ed")]), Uint.from(size));

    await Promise.all(promises);
    await level.close();
}
async function gen_minter(size: number, db: LevelDBUtils.DBs = "stake1") {

    const level = await LevelDBUtils.openDB(db);
    
    const validator_preifx = PX.A_0e;
    const version_Prefix = PX.V_00;

    const promises: Promise<void>[] = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(
                AddressHex.fromTypeAndBody(validator_preifx, Uint.from(LCrypt.randomBytes(20))),
                Uint.concat([
                    version_Prefix,
                    Uint64.from(32_0000_0000)
                ])
            )
        );
    }

    await Promise.all(promises);
    await level.close();
}


async function selectNextValidators_old(db: LevelDBUtils.DBs, seedHash: Uint256): Promise<[Uint[], number, boolean]> {
    const level = await LevelDBUtils.openDB(db);

    let using_first_validators = false;

    let elapsedTime: number;
    const startTime = startTimer();

    let validators: Uint[] = await level.keys({limit: 129}).all();
    if (validators.length <= 128) {
        using_first_validators = true;
    } else {
        validators = [];
        let nextHash = seedHash;

        while (validators.length !== 128) {
            let winner = (
                (await level.keys({gte: nextHash, limit: 1}).all())[0] ||
                (await level.keys({lte: nextHash, limit: 1, reverse: true}).all())[0]
            );
            if (!validators.some(item => item.eq(winner))) {
                validators.push(winner);
            }
            nextHash = LCrypt.sha256(nextHash);
        }
        elapsedTime = endTimer(startTime);
    }
    elapsedTime = endTimer(startTime);
    await level.close();
    return [validators, elapsedTime, using_first_validators];
}

async function selectNextValidators(db: LevelDBUtils.DBs, seedHash: Uint256): Promise<[Dict<Uint>, number, boolean]> {
    const level = await LevelDBUtils.openDB(db);

    let using_first_validators = false;

    let elapsedTime: number;
    const startTime = startTimer();

    const validators: Dict<Uint> = {};
    const validators_count = await level.get(Uint.from("ff00ed"));
    const validator_preifx = PX.A_0e;

    if (validators_count.lte(128)) {
        using_first_validators = true;
        for await (const [index, data] of level.iterator()) {
            if (index.slice(0, 1).eq(PX.META)) continue;
            validators[index.slice(1).toInt()] = data;
        }
    } else {
        let nextHash = seedHash;
        const takenIndexes: number[] = [];

        while (takenIndexes.length !== 128) {
            let nextIndex = nextHash.mod(validators_count);

            if (!takenIndexes.includes(nextIndex)) {
                takenIndexes.push(nextIndex);

                const validator_index = Uint.from(nextIndex);

                const validator_data = await level.get(Uint.concat([validator_preifx, validator_index]));
                validators[nextIndex] = validator_data;
            }
            nextHash = LCrypt.sha256(Uint.concat([nextHash, seedHash]));
        }
        elapsedTime = endTimer(startTime);
    }
    elapsedTime = endTimer(startTime);
    await level.close();
    return [validators, elapsedTime, using_first_validators];
}

async function selectNextMinter(slot, customLevel?: LevelDB) {
    let level = customLevel || await LevelDBUtils.openDB("stake1");

    const slotHash = Uint.concat([
        PX.A_0e,
        LCrypt.sha256(slot).split(20)[0]
    ]);

    // console.log("Hash: ", slotHash.toHex());
    const address = new AddressHex(
        (await level.keys({gte: slotHash, limit: 1}).all())[0] ||
        (await level.keys({lte: slotHash, limit: 1, reverse: true}).all())[0]
    );
    if (!customLevel) {
        await level.close();
    }
    return address;
}

async function test1(db: LevelDBUtils.DBs, func: (db: LevelDBUtils.DBs, seedHash: Uint256) => Promise<any>, returnTime?: false): Promise<undefined>;
async function test1(db: LevelDBUtils.DBs, func: (db: LevelDBUtils.DBs, seedHash: Uint256) => Promise<any>, returnTime: true): Promise<number>;
async function test1(db: LevelDBUtils.DBs = "stake1", func = selectNextValidators, returnTime = false) {
    let nextHash = LCrypt.sha256(LCrypt.randomBytes(32));
    
    const startTime = startTimer();

    for (let i = 0; i < 10; i++) {
        await func(db, nextHash);
        nextHash = LCrypt.sha256(LCrypt.randomBytes(32));
    }

    const elapsedTime = endTimer(startTime);
    if (returnTime) {
        return elapsedTime;
    }
    console.log("Elapsed average time:", elapsedTime / 1000 / 10, "seconds");
}

async function fastestSelectNextValidators() {

    //const time1 = await test1("stake1", selectNextValidators_old, true);
    const time2 = await test1("stake3", selectNextValidators, true);

    //console.log("Elapsed average time 1:", time1 / 1000 / 10, "seconds");
    console.log("Elapsed average time 2:", time2 / 1000 / 10, "seconds");
    //console.log("New Selecting is", time1 / time2, "times faster then the old method");

}

async function test2(db1: LevelDBUtils.DBs = "stake1", db2: LevelDBUtils.DBs = "stake2", func = selectNextValidators, seedHash = LCrypt.sha256(LCrypt.randomBytes(32))) {
    
    const results = [
        await func(db1, seedHash),
        await func(db2, seedHash)
    ];

    for (const [index, result] of results.entries()) {
        console.log(`Results for DB ${index + 1}`);
        //console.log(result[0]);
        console.log("  Elapsed time:", result[1] / 1000, "seconds");
        console.log(result[2] ? "  Using first 128 validators" : "  Using selected validators");
    }

    console.log("Result is the same:", results[0][0].toString() === results[1][0].toString());

}

async function test3(db: LevelDBUtils.DBs = "stake1", func = selectNextValidators_old, seedHash = LCrypt.sha256(LCrypt.randomBytes(32))) {
    
    const result = await func(db, seedHash);
    const temp: Uint[] = [];
    let noDuplicates = true;

    for (const validator of result[0]) {
        noDuplicates = noDuplicates && !(temp.some(item => item.eq(validator)));
        temp.push(validator);
    }

    console.log(noDuplicates);

}

async function test4() {
    const target = (await selectNextValidators_old("stake1", LCrypt.sha256(LCrypt.randomBytes(32))))[0][0];
    console.log("Target:", target);

    const startTime = startTimer();

    let index = 0;

    while (true) {
        //console.log("Round:", index);
        const proposer = (await selectNextValidators_old("stake1", LCrypt.sha256(LCrypt.randomBytes(32))))[0][127];
        if (proposer.eq(target)) {
            console.log("Found:", proposer);
            break;
        }
        index ++;
    }

    const elapsedTime = endTimer(startTime);
    console.log("Rounds:", index);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");
}

async function test5(returnPicks?: false, slotsCount?: number, randomSlotIndexes?: boolean, level?: LevelDB): Promise<undefined>;
async function test5(returnPicks: true, slotsCount?: number, randomSlotIndexes?: boolean, level?: LevelDB): Promise<AddressHex[]>;
async function test5(returnPicks = false, slotsCount = 100, randomSlotIndexes = false, level?: LevelDB) {
    let print = returnPicks ? () => {} : console.log;
    let slotIndexGenerator = randomSlotIndexes ? 
        (i: any) => Uint.from(Math.floor(Math.random() * 1_000_000)) :
        (i: number) => Uint.from(i);

    const results: AddressHex[] = [];
    
    for (let i = 0; i < slotsCount; i++) {
        results[i] = await selectNextMinter(slotIndexGenerator(i), level);;
        print("Address:", results[i].toHex());
    }
    if (returnPicks) return results;
}

async function test_minter_randomness(config: {
    mintersCount: number,
    slotsCount: number,
    randomSlotIndexes: boolean,
    randomMinters: boolean,
    sortedBy: "address" | "count",
    onlyFirst2Digits: boolean
} = {
    mintersCount: 2,
    slotsCount: 100,
    randomSlotIndexes: false,
    randomMinters: false,
    sortedBy: "count",
    onlyFirst2Digits: false
}) {
    const {mintersCount, slotsCount, randomSlotIndexes, randomMinters, sortedBy, onlyFirst2Digits} = config;

    await gen_minter(mintersCount, "stake1");
    const level = await LevelDBUtils.openDB("stake1");

    const minterAddresses = await level.keys().all();

    let frequencyMap: UintMap<Uint64>;

    if (onlyFirst2Digits) {
        frequencyMap = new UintMap<Uint64>(minterAddresses.map(address => [address.slice(0, 2), Uint64.from(0)]));
    } else {
        frequencyMap = new UintMap<Uint64>(minterAddresses.map(address => [address, Uint64.from(0)]));
    }

    let chosenMinters: Uint[];

    if (randomMinters) {
        chosenMinters = [];
        for (let i = 0; i < slotsCount; i++) {
            chosenMinters.push(minterAddresses[Math.floor(Math.random() * mintersCount)]);
        }
    } else {
        chosenMinters = await test5(true, slotsCount, randomSlotIndexes, level);
    }

    for (let i = 0; i < slotsCount; i++) {
        chosenMinters.push();
    }

    if (onlyFirst2Digits) {
        for (const address of chosenMinters) {
            (frequencyMap.get(address.slice(0, 2)) as Uint64).iadd(1);
        }
    } else {
        for (const address of chosenMinters) {
            (frequencyMap.get(address) as Uint64).iadd(1);
        }
    }

    let sortedResults: [Uint, Uint64][];

    if (sortedBy === "address") {
        sortedResults = frequencyMap.entries().all().sort((a, b) => {
            return a[0].toHex().localeCompare(b[0].toHex());
        });
    } else {
        sortedResults = frequencyMap.entries().all().sort((a, b) => {
            return b[1].toInt() - a[1].toInt();
        });
    }

    const green_underline = "\x1b[38;2;0;150;0m\x1b[4m";
    const reset = "\x1b[0m";

    console.log(green_underline + `Results sorted by ${sortedBy}:` + reset);

    for (const [index, [address, count]] of sortedResults.entries()) {
        const light_blue = "\x1b[38;2;58;150;221m";
        const light_magenta = "\x1b[38;2;221;58;150m";
        const color = index % 2 === 0 ? light_blue : light_magenta;

        if (onlyFirst2Digits) {
            console.log(color +
                `Prefix: ${address.toHex().slice(2, 4)}` + "    " +
                `${count.toInt()} times` +
            reset);
        } else {
            console.log(color +
                `Minter: ${address.toHex()}` + "    " +
                `${count.toInt()} times` +
            reset);
        }
    }

    let highestCount = sortedResults[0][1];
    let lowestCount = sortedResults[0][1];

    for (const [address, count] of sortedResults) {
        if (count.gt(highestCount)) {
            highestCount = count;
        } else if (count.lt(lowestCount)) {
            lowestCount = count;
        }
    }

    console.log("Difference Ratio:", highestCount.toInt() / (lowestCount.toInt() === 0 ? 1 : lowestCount.toInt()));

    await level.close();
    await LevelDBUtils.destroyDB("stake1");
}

async function test_minter_randomness2(config: {
    mintersCount: number,
    reverse: boolean,
} = {
    mintersCount: 10,
    reverse: false
}) {
    const { mintersCount, reverse } = config;

    await gen_minter(mintersCount, "stake1");
    const level = await LevelDBUtils.openDB("stake1");

    const hash = Uint.concat([
        PX.A_0e,
        LCrypt.sha256(LCrypt.randomBytes(32)).split(20)[0]
    ]);

    let results: Uint[];

    if (reverse) {
        results = await level.keys({lte: hash,reverse: true}).all();
    } else {
        results = await level.keys({gte: hash}).all();
    }

    const green_underline = "\x1b[38;2;0;150;0m\x1b[4m";
    const reset = "\x1b[0m";

    console.log("Base Hash:\n" + green_underline +
        hash.toHex() +
    reset);

    for (const [index, address] of results.entries()) {
        const light_blue = "\x1b[38;2;58;150;221m";
        const light_magenta = "\x1b[38;2;221;58;150m";
        const color = index % 2 === 0 ? light_blue : light_magenta;

        console.log(color +
            address.toHex() +
        "\x1b[0m");
    }

    console.log("Results count:", results.length);

    await level.close();
    await LevelDBUtils.destroyDB("stake1");
}

//gen_old(129);
//gen(129, "stake3");
//gen_old(100_000);
//gen_old(1_000);
//gen(1_000_000, "stake3")
//gen_minter(1_000_000, "stake1")
//gen_minter(2, "stake1")

//await gen();

//speedTest("stake3", null);

//test2("stake1", "stake2");
//test2("stake3", "stake4");

//test1("stake3");

//fastestSelectNextValidators();

/*
(async() => {

    let uint;
    let uint1 = Uint.from("abcdef");
    let uint2 = Uint.from("012345");

    const startTime = startTimer();

    for (let i = 0; i < 1_000_000; i++) {
        uint = Uint.concat([uint1, uint2]);
    }

    const elapsedTime = endTimer(startTime);
    console.log(uint);
    console.log("Elapsed time:", elapsedTime / 1000, "seconds");

})();
*/

//test1("stake1", selectNextValidators_old);
//test2("stake1", "stake2", selectNextValidators_old);
//test3();
//test4()
//test5();



test_minter_randomness({
    mintersCount: 10,
    slotsCount: 100,
    randomSlotIndexes: true,
    randomMinters: false,
    sortedBy: "count",
    onlyFirst2Digits: false
});

// test_minter_randomness2({
//     mintersCount: 10,
//     reverse: false
// });

