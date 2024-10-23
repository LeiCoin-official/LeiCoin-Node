import path from "path";
import LevelDB from "./index.js";
import BCUtils from "../blockchainUtils.js";
import { Uint } from "low-level/uint";
import { LevelIndexes } from "./indexes.js";

export abstract class LevelBasedStorage {

    protected level: LevelDB = null as any;
    protected abstract path: string;
    protected chain: string = "";

    private initialized = false;

    constructor(chain: string) {
        this.chain = chain;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        
        BCUtils.ensureDirectoryExists(this.path, this.chain);
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath(this.path, this.chain)));
        await this.level.open();
    }

    async close() {
        await this.level.close();
    }

    
    async getAllKeys() {
        return this.level.keys().all();
    }
    

    protected async getData(key: Uint) {
        try {
            return await this.level.get(key);
        } catch {
            return null;
        }
    }

    protected async delData(key: Uint) {
        try {
            return await this.level.del(key);
        } catch {
            return null;
        }
    }

}

export abstract class LevelBasedStorageWithIndexes extends LevelBasedStorage {

    protected abstract keyByteLengthWithoutPrefix: number;
    protected keyPrefix: Uint = Uint.alloc(0);
    protected indexes: LevelIndexes = null as any;

    constructor(chain: string) {
        super(chain);
    }

    async init() {
        await super.init();
        this.indexes = new LevelIndexes(this.level, this.keyByteLengthWithoutPrefix, this.keyPrefix);
        await this.indexes.load();
    }

}