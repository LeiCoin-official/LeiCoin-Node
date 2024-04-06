import { Level } from "level";
import { BlockchainUtils as BCUtils } from "./blockchainUtils.js"
import path from "path";

export class ValidatorDB {

    private readonly level: Level;
    private readonly inactiveLevel: Level;
    private readonly chain: string;

    constructor(chain = "main") {
        BCUtils.ensureDirectoryExists('/validators', chain);
        this.chain = chain;
        this.level = new Level(path.join(BCUtils.getBlockchainDataFilePath("/validators", chain)), {keyEncoding: "hex", valueEncoding: "hex"});
        this.inactiveLevel = new Level(path.join(BCUtils.getBlockchainDataFilePath("/inactive_validators", chain)), {keyEncoding: "hex", valueEncoding: "hex"});
    }

    

}

export default ValidatorDB;