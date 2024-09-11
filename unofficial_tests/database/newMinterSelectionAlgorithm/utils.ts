import { Uint, Uint64 } from "../../../src/binary/uint.js";
import LCrypt from "../../../src/crypto/index.js";
import { AddressHex } from "../../../src/objects/address.js";
import { PX } from "../../../src/objects/prefix.js";
import { type LevelDB } from "../../../src/storage/leveldb/index.js";
import { LevelDBUtils } from "../leveldb_utils.js";

export const metaSizeAddress = AddressHex.fromTypeAndBody(PX.META, Uint.from(2, 20));
export const firstMetaAddress = AddressHex.fromTypeAndBody(PX.META, Uint.alloc(20));

export async function generateMinterDB(size: number, db: LevelDBUtils.DBs) {
    const level = await LevelDBUtils.openDB(db);

    const promises: Promise<void>[] = [];

    for (let i = 0; i < size; i++) {
        promises.push(
            level.put(
                AddressHex.fromTypeAndBody(PX.A_0e, Uint.from(LCrypt.randomBytes(20))),
                Uint.concat([
                    PX.V_00,
                    Uint64.from(32_0000_0000)
                ])
            )
        );
    }

    promises.push(level.put(metaSizeAddress, Uint64.from(size)));

    await Promise.all(promises);

    return level;
}

async function selectNextMinter1(slot: Uint64, level: LevelDB): Promise<AddressHex> {
    const size = await level.get(metaSizeAddress);
    const randomIndex = LCrypt.sha256(slot).mod(size);

    const count = Uint64.from(0);
    const minterAddressesStream = level.createKeyStream({lt: firstMetaAddress});
    for await (const key of minterAddressesStream) {
        if (count.eq(randomIndex)) {
            minterAddressesStream.destroy();
            return new AddressHex(key);
        }
        count.iadd(1);
    }
    process.exit(1); // Should never reach this point
}

async function selectNextMinter2(slot: Uint64, level: LevelDB): Promise<AddressHex> {
    let count = 0;
    let randomAddress: AddressHex | null = null;

    const minterAddressesStream = level.createKeyStream({lt: firstMetaAddress});

    for await (const key of minterAddressesStream) {
        count++;
        if (Math.random() < 1 / count) {
            randomAddress = new AddressHex(key);
        }
    }
    return randomAddress as AddressHex;
}

export { selectNextMinter1 as selectNextMinter };
