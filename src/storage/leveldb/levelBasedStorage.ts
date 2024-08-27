import path from "path";
import LevelDB from "./index.js";
import BCUtils from "../blockchainUtils.js";
import { Uint } from "../../binary/uint.js";

export abstract class LevelBasedStorage {

    // @ts-ignore
    protected level: LevelDB = null;
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
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath(this.path, this.chain)));
        await this.level.open();
    }

    public async close() {
        await this.level.close();
    }

    
    public async getAllKeys() {
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
