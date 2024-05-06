import LevelDB from "./leveldb.js";
import { BlockchainUtils as BCUtils } from "./blockchainUtils.js";
import path from "path";
import { AddressHex } from "../objects/address.js";
import { Uint } from "../utils/binary.js";

class SmartContractStateDB {

    private readonly level: LevelDB;
    private readonly chain: string;

    constructor(chain: string) {
        BCUtils.ensureDirectoryExists('/smart-contracts/state', chain);
        this.chain = chain;
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath("/smart-contracts/state", chain)));
    }

    public async getState(address: AddressHex) {
        return this.level.get(address);
    }

    public async setState(address: AddressHex, state: Uint) {
        return this.level.put(address, state);
    }

}

export default SmartContractStateDB;
