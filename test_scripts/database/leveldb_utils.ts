import LevelDB from "../../src/storage/leveldb/index.js";
import path from "path";

export namespace LevelDBUtils {

    export type DBs = "stake1" | "stake2" | "stake3" | "stake4";

    export function getDBPath(db: DBs) {
        return path.join(process.cwd(), `/localtests/testsdbs/${db}`);
    }
    
    export async function openDB(db: DBs) {
        const level = new LevelDB(getDBPath(db));
        await level.open();
        return level;
    }

    export async function destroyDB(db: DBs) {
        await LevelDB.destroy(getDBPath(db));
    }

}