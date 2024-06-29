import Validator from "../objects/minter.js";
import Block from "../objects/block.js";
import { AddressHex } from "../objects/address.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import Crypto from "../crypto/index.js";
import { LevelBasedStorage } from "./storageTypes.js";

export class MinterDB extends LevelBasedStorage {

    protected path = "/validators";

    public async getAllVAddresses() {
        return this.level.keys().all();
    }

    public async getValidator(address: AddressHex) {
        const raw_validator_data = await this.level.get(address);
        return Validator.fromDecodedHex(address, raw_validator_data);
    }

    public async setValidator(validator: Validator) {
        return this.level.put(validator.address, validator.encodeToHex());
    }

    public async removeValidator(validator: Validator) {
        return this.level.del(validator.address);
    }

    private async adjustStakeByBlock(block: Block) {
        
        //const inActive = this.getValidatorInLevel(address, "active");

    }

    public async selectNextMinter(slot: Uint64) {
        let slotHash = Crypto.sha256(slot).split(21)[0];
        return new AddressHex(
            (await this.level.keys({gte: slotHash, limit: 1}).all())[0] ||
            (await this.level.keys({lte: slotHash, limit: 1, reverse: true}).all())[0]
        );
    }

}

export default MinterDB;
