import LevelDB from "./leveldb/index.js";
import BCUtils from "./blockchainUtils.js";
import path from "path";
import { AddressHex } from "../objects/address.js";
import { Uint } from "low-level";
import { LevelBasedStorage } from "./leveldb/levelBasedStorage.js";

class SmartContractStateDB extends LevelBasedStorage {

    protected path = "/smart-contracts/state";

    public async getState(address: AddressHex) {
        return this.getData(address.getBody());
    }

    public async setState(address: AddressHex, state: Uint) {
        return this.level.put(address.getBody(), state);
    }

}

export default SmartContractStateDB;
