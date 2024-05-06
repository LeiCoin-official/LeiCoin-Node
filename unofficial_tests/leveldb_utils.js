import LevelDB from "../build/src/storage/leveldb.js";
import path from "path";

/** @typedef {"stake1" | "stake2" | "stake3" | "stake4"} DBs */

/** @type {(db: DBs) => string} */
export function getDBPath(db) {
    return path.join(process.cwd(), "/blockchain_data", `/tests/${db}`);
}

/** @type {(db: DBs) => Promise<LevelDB<Uint, Uint>>} */
export async function openDB(db) {
    const level = new LevelDB(getDBPath(db));
    await level.open();
    return level;
}
