import LevelDB from "./leveldb.js";
import BCUtils from "./blockchainUtils.js";
import path from "path";
import { AddressHex } from "../objects/address.js";
import { Uint } from "../utils/binary.js";
import { LevelBasedStorage } from "./storageTypes.js";

class SmartContractStateDB extends LevelBasedStorage {

    protected path = "/smart-contracts/state";

    public async getState(address: AddressHex) {
        return this.level.get(address.getBody());
    }

    public async setState(address: AddressHex, state: Uint) {
        return this.level.put(address.getBody(), state);
    }

}

export default SmartContractStateDB;
