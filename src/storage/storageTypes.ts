import path from "path";
import LevelDB from "./leveldb.js";
import BCUtils from "./blockchainUtils.js";

export abstract class LevelBasedStorage {

    // @ts-ignore
    protected level: LevelDB = null;
    protected abstract path: string;
    protected chain: string = "";

    public constructor(chain: string) {
        this.chain = chain;
    }

    public async init() {
        BCUtils.ensureDirectoryExists(this.path, this.chain);
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath(this.path, this.chain)));
        await this.level.open();
    }

}
