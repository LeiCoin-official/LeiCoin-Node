
```ts

const range = 100 // range of adresses the db is splittet into
const indexes: Array<{
    // the first address that exists in this range.
    // for example in range 0xb000 - 0xbfff it is 0xb000
    rangeStartingPoint: Address,

    // the number of active addresses in this range
    size: number
}> = [];

events.on("leiCoinNodeStartup", () => {
    const db = new Level("./minters").open();

    // iterate over db keys only once at startup
    for (const [i, address] of db.keys()) {
        const currentRange = Math.round(i / range);
        // select every n (=range) key
        if (i % range === 0) {
            indexes[currentRange] = {
                rangeStartingPoint: address,
                size: 1
            }
        }
        indexes[currentRange].size++;
    }
});

function selectMinterByIndex(index: number) {
    let sizeCount = 0;

    let lastRange = ;

    for (const [i, range] of indexes.entries()) {
        if (sizeCount + range.size > index) {
            return range.rangeStartingPoint;
        }
        sizeCount += range.size;
    }

    throw new Error("Minter Index out of range")
}

```