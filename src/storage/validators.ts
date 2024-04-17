import { Level } from "level";
import { BlockchainUtils as BCUtils } from "./blockchainUtils.js"
import path from "path";
import Validator from "../objects/validator.js";
import Block from "../objects/block.js";

type DB = "active" | "inactive";

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

    private getLevel(db?: DB) {
        if (db === "inactive") {
            return this.inactiveLevel;
        }
        return this.level;
    }

    private async getValidatorInLevel(address: string, db?: DB) {
        const level = this.getLevel(db);
        const raw_validator_data = await level.get(address);
        return Validator.fromDecodedHex(address, raw_validator_data);
    }

    private async setValidatorInLevel(validator: Validator, db?: DB) {
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

}

export default ValidatorDB;