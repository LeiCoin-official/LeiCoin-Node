import { AddressHex } from "@leicoin/common/models/address";
import { Uint } from "low-level";
import { LevelBasedStateStorage } from "./leveldb/levelBasedStorage.js";

export class SmartContractStateDB extends LevelBasedStateStorage {

    protected path = "/smart-contracts/state";

    public async getState(address: AddressHex) {
        return this.getData(address.getBody());
    }

    public async setState(address: AddressHex, state: Uint) {
        return this.level.put(address.getBody(), state);
    }

}


