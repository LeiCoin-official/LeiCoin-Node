import { Level } from "level";
import { BlockchainUtils as BCUtils } from "./blockchainUtils.js"
import path from "path";
import Validator from "../objects/validator.js";

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

    private async getValidatorInLevel(publicKey: string, level: Level) {
        const raw_validator_data = await level.get(publicKey);
        return Validator.fromDecodedHex(publicKey, raw_validator_data);
    }

    private async setValidatorInLevel(validator: Validator, level: Level) {
        await level.put(validator.publicKey, validator.encodeToHex());
    }

    public async addActiveValidator(validator: Validator) {
        
    }
    public async addInactiveValidator(validator: Validator) {

    }

    public async getActiveValidator(publicKey: string) {
        
    }
    public async getInactiveValidator(publicKey: string) {

    }

    public async removeActiveValidator(publicKey: string) {

    }
    public async removeInactiveValidator() {

    }

    public async transferToInactiveValidator(publicKey: string) {

    }

    public async getValidator() {

    }

}

export default ValidatorDB;