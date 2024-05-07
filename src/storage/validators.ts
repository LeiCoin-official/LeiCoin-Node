import { BlockchainUtils as BCUtils } from "./blockchainUtils.js";
import path from "path";
import Validator from "../objects/validator.js";
import Block from "../objects/block.js";
import { AddressHex } from "../objects/address.js";
import LevelDB from "./leveldb.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import { PX } from "../objects/prefix.js";
import { Dict } from "../utils/objects.js";
import Crypto from "../crypto/index.js";

export class ValidatorDB {

    private readonly active: Uint64[] = [];
    private readonly level: LevelDB;
    private readonly chain: string;

    constructor(chain: string) {
        BCUtils.ensureDirectoryExists('/validators', chain);
        this.chain = chain;
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath("/validators", chain)));
    }

    public async loadActive() {
        this.level.get()
    }

    public async setActive() {

    }

    private async getValidator(index: Uint64) {
        const raw_validator_data = await this.level.get(address);
        return Validator.fromDecodedHex(raw_validator_data);
    }

    private async getValidatorByAddress(address: AddressHex) {
        const raw_validator_data = await this.level.get(address);
        return Validator.fromDecodedHex(raw_validator_data);
    }

    private async setValidator(validator: Validator) {
        return this.level.put(validator.address, validator.encodeToHex());
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

    private async adjustStakeByBlock(block: Block) {
        
        //const inActive = this.getValidatorInLevel(address, "active");

    }

    public async selectNextValidators(seedHash: Uint256) {
    
        const validators: Dict<Uint> = {};
        const validators_count = await this.level.get(Uint.from("ff00ed"));
        const validator_preifx = PX.A_0e;
    
        if (validators_count.lte(128)) {
            for await (const [index, data] of this.level.iterator()) {
                if (index.slice(0, 1).eq(PX.META)) continue;
                validators[index.slice(1).toInt()] = data;
            }
        } else {
            let nextHash = seedHash;
            const takenIndexes: number[] = [];
    
            while (takenIndexes.length !== 128) {
                let nextIndex = nextHash.mod(validators_count);
    
                if (!takenIndexes.includes(nextIndex)) {
                    takenIndexes.push(nextIndex);
    
                    const validator_index = Uint.from(nextIndex);
    
                    const validator_data = await this.level.get(Uint.concat([validator_preifx, validator_index]));
                    validators[nextIndex] = validator_data;
                }
                nextHash = Crypto.sha256(Uint.concat([nextHash, seedHash]));
            }
        }
        return validators;
    }

}

export default ValidatorDB;