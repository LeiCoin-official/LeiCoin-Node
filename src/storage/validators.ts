import Validator from "../objects/validator.js";
import Block from "../objects/block.js";
import { AddressHex } from "../objects/address.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import Crypto from "../crypto/index.js";
import { LevelBasedStorage } from "./storageTypes.js";

export class ValidatorDB extends LevelBasedStorage {

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

    public async selectNextValidators(slot: Uint64) {

        let validators: Uint[] = await this.level.keys({limit: 129}).all();
        if (validators.length <= 128) {
            return validators;
        }

        validators = [];
        let nextHash = Crypto.sha256(slot).split(21)[0];

        while (validators.length !== 128) {
            let winner = (
                (await this.level.keys({gte: nextHash, limit: 1}).all())[0] ||
                (await this.level.keys({lte: nextHash, limit: 1, reverse: true}).all())[0]
            );
            if (!validators.some(item => item.eq(winner))) {
                validators.push(winner);
            }
            nextHash = Crypto.sha256(nextHash).split(21)[0];
        }
        return validators;

    }

}

export default ValidatorDB;
