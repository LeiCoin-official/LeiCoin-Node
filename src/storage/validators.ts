import { BlockchainUtils as BCUtils } from "./blockchainUtils.js";
import path from "path";
import Validator from "../objects/validator.js";
import Block from "../objects/block.js";
import { AddressHex } from "../objects/address.js";
import LevelDB from "./leveldb.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import Crypto from "../crypto/index.js";
import validator from "../validators/index.js";

export class ValidatorDB {

    private readonly level: LevelDB;
    private readonly chain: string;

    constructor(chain: string) {
        BCUtils.ensureDirectoryExists('/validators', chain);
        this.chain = chain;
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath("/validators", chain)));
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

    public async selectNextValidators(seedHash: Uint256) {

        let validators: Uint[] = await this.level.keys({limit: 129}).all();
        if (validators.length <= 128) {
            return validators;
        }

        validators = [];
        let nextHash = seedHash.split(21)[0];

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