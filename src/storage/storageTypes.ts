import path from "path";
import LevelDB from "./leveldb.js";
import BCUtils from "./blockchainUtils.js";

export abstract class LevelBasedStorage {

    protected readonly level: LevelDB;
    protected readonly path: string = "/";
    protected readonly chain: string;

    constructor(chain: string) {
        BCUtils.ensureDirectoryExists(this.path, chain);
        this.chain = chain;
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath(this.path, chain)));
    }
    public async open() {
        return this.level.open();
    }
}
