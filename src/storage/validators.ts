import { BlockchainUtils as BCUtils } from "./blockchainUtils.js"
import path from "path";
import Validator from "../objects/validator.js";
import Block from "../objects/block.js";
import { AddressHex } from "../objects/address.js";
import LevelDB from "./leveldb.js";

type DBVariant = "active" | "inactive";

export class ValidatorDB {

    private readonly level: LevelDB;
    private readonly inactiveLevel: LevelDB;
    private readonly chain: string;

    constructor(chain = "main") {
        BCUtils.ensureDirectoryExists('/validators', chain);
        this.chain = chain;
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath("/validators", chain)));
        this.inactiveLevel = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath("/inactive_validators", chain)));
    }

    private getLevel(db?: DBVariant) {
        if (db === "inactive") {
            return this.inactiveLevel;
        }
        return this.level;
    }

    private async getValidatorInLevel(address: AddressHex, db?: DBVariant) {
        const level = this.getLevel(db);
        const raw_validator_data = await level.get(address);
        return Validator.fromDecodedHex(address, raw_validator_data);
    }

    private async setValidatorInLevel(validator: Validator, db?: DBVariant) {
        const level = this.getLevel(db);
        await level.put(validator.address, validator.encodeToHex());
    }

    public async addInactiveValidator(validator: Validator) {

    }

    public async getActiveValidator(address: string) {
        
    }
    public async getInactiveValidator(address: string) {

    }

    public async removeActiveValidator(address: string) {

    }
    public async removeInactiveValidator() {

    }

    public async transferToInactiveValidator(address: string) {

    }

    public async getValidator() {

    }

    private async adjustStakeByBlock(block: Block) {
        
        //const inActive = this.getValidatorInLevel(address, "active");

    }

    public async selectNextValidators(hash: string) {
    
        let validators = await level.keys({limit: 129}).all();
        if (validators.length <= 128) {
            using_first_validators = true;
        } else {
            validators = [];
            let nextHash = seedHash;
    
            while (validators.length !== 128) {
    
                let winner = (
                    (await level.keys({gte: nextHash, limit: 1}).all())[0] ||
                    (await level.keys({lte: nextHash, limit: 1, reverse: true}).all())[0]
                );
                if (!validators.some(item => item.eq(winner))) {
                    validators.push(winner);
                }
                nextHash = Crypto.sha256(nextHash);
            }
            elapsedTime = endTimer(startTime);
        }
        elapsedTime = endTimer(startTime);
        level.close();
        return [validators, elapsedTime, using_first_validators];
    }

}

export default ValidatorDB;