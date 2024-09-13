import LevelDB from "./index.js";
import { Uint, Uint64 } from "../../binary/uint.js";

export class LevelKeyIndexRange {

    constructor(
        private rangeStartingPoint: Uint,
        private byteLength: number,
        private prefix: Uint,
        public size: Uint64
    ) {}

    static fromStep(step: number, byteLength: number, prefix: Uint): LevelKeyIndexRange {
        return new LevelKeyIndexRange(
            Uint.concat([
                Uint.from(step),
                Uint.alloc(byteLength -1)
            ]),
            byteLength,
            prefix,
            Uint64.from(0)
        );
    }

    public get firstPossibleKey() {
        return Uint.concat([
            this.prefix,
            this.rangeStartingPoint
        ]);
    }

    public get lastPossibleKey(): Uint {
        return Uint.concat([
            this.prefix,
            this.rangeStartingPoint.slice(0, 1),
            Uint.alloc(this.byteLength -1, 0xff)
        ]);
    }
}

export class LevelIndexes {

    static readonly rangeSize = 256;

    private initialized = false;

    constructor(
        private readonly level: LevelDB,
        private readonly byteLength: number,
        private readonly prefix: Uint = Uint.alloc(0),
        private readonly ranges: LevelKeyIndexRange[] = []
    ) {}

    async load() {
        if (this.initialized) return;

        for (let i = 0; i < LevelIndexes.rangeSize; i++) {
            const currentRange = LevelKeyIndexRange.fromStep(i, this.byteLength, this.prefix);

            const keyStream = this.level.createKeyStream({gte: currentRange.firstPossibleKey, lte: currentRange.lastPossibleKey});

            for await (const address of keyStream) {
                currentRange.size.iadd(1);
            }

            this.ranges.push(currentRange);
        }
    }

    async getRange(key: Uint) {
        for (const range of this.ranges) {
            if (key.gte(range.firstPossibleKey) && key.lte(range.lastPossibleKey)) {
                return range;
            }
        }
        // Should never reach this point bacause any key has a corresponding range
        throw new Error("No range found for key. Are the ranges initialized?");
    }

    async getRangeByIndex(index: Uint64) {
        const totalOffset = Uint64.from(0);

        for (const range of this.ranges) {
            if (totalOffset.add(range.size).gt(index)) {
                return {
                    range,
                    offset: index.sub(totalOffset)
                };
            }
            totalOffset.iadd(range.size);
        }

        throw new Error("Index is not part of any range. Are the ranges initialized?");
    }

    async addKey(key: Uint) {
        (await this.getRange(key)).size.iadd(1);
    }

    async removeKey(key: Uint) {
        (await this.getRange(key)).size.isub(1);
    }

}
