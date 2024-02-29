import { Level } from "level";
import path from "path";

async function main() {

    const utxosIndex = new Level(path.join("./blockchain_data/indexes/utxos"), {keyEncoding: "hex", valueEncoding: "hex"});
    //const utxosIndex = new Level(path.join("./blockchain_data/indexes/utxos"));

    await utxosIndex.put("a", "1");

    const data = await utxosIndex.get("a");

    console.log(data);

}

main();