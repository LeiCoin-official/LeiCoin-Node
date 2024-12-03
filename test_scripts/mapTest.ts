import { UintMap } from "low-level";
import { Uint } from "low-level";

function test_selection() {

    const map = new UintMap<Uint>();

    map.set(Uint.from("0x01020304"), Uint.from("0x01020304", "utf8"));
    console.log(map.get(Uint.from("0x01020304"))?.toHex());
}

function testGarbageCollection() {

    function parseMemoryUsage(usage: Object) {
        return Object.entries(usage).map(([key, value]) => `- ${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`).join("\n");
    }

    function testWithMap() {
        let uint_map = new Map<string, string>();

        const memoryUsageAtStart = process.memoryUsage();

        for (let i = 0; i < 1000000; i++) {
            uint_map.set(i.toString(), i.toString());
            uint_map.delete(i.toString());
        }

        const memoryUsageAfterCodeExecution = process.memoryUsage();

        return `${((memoryUsageAfterCodeExecution.rss - memoryUsageAtStart.rss) / 1024 / 1024 * 100) / 100} MB`;
    }

    function testWithDict() {
        const uint_map: {[key: string]: string} = {};

        const memoryUsageAtStart = process.memoryUsage();

        for (let i = 0; i < 1000000; i++) {
            uint_map[i.toString()] = i.toString();
            delete uint_map[i.toString()];
        }

        const memoryUsageAfterCodeExecution = process.memoryUsage();

        return `${((memoryUsageAfterCodeExecution.heapTotal - memoryUsageAtStart.heapTotal) / 1024 / 1024 * 100) / 100} MB`;
    }

    //console.log("Memory Usage Difference using Map: " + testWithMap());
    console.log("Memory Usage Difference using Dict: " + testWithDict());

}

function testMapVsDict() {



}



testGarbageCollection();

