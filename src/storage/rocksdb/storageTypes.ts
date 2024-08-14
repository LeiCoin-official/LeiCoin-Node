import path from "path";
import RocksDB from "./index.js";
import BCUtils from "../blockchainUtils.js";

export abstract class RocksBasedStorage {

    // @ts-ignore
    protected level: RocksDB = null;
    protected abstract path: string;
    protected chain: string = "";

    private initialized = false;

    public constructor(chain: string) {
        this.chain = chain;
    }

    public async init() {
        if (this.initialized) return;
        this.initialized = true;
        
        BCUtils.ensureDirectoryExists(this.path, this.chain);
        this.level = new RocksDB(path.join(BCUtils.getBlockchainDataFilePath(this.path, this.chain)));
        await this.level.open();
    }

}

