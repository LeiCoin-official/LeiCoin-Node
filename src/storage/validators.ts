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

    private active: Uint64[] = [];
    private readonly active_key = Uint.concat([PX.META, Uint.from("00ed")]);

    private readonly level: LevelDB;
    private readonly chain: string;

    constructor(chain: string) {
        BCUtils.ensureDirectoryExists('/validators', chain);
        this.chain = chain;
        this.level = new LevelDB(path.join(BCUtils.getBlockchainDataFilePath("/validators", chain)));
    }

    private getWithVPX(data: Uint) {
        return Uint.concat([PX.A_0c, data]);
    }

    private getWithMetaPX(data: Uint) {
        return Uint.concat([PX.META, data]);
    }

    public async loadActive() {
        this.active = (await this.level.get(this.active_key)).nci_split(Uint64, 8);
    }

    public async setActive() {

    }

    private async getValidator(index: Uint64) {
        const raw_validator_data = await this.level.get(this.getWithVPX(index));
        return Validator.fromDecodedHex(raw_validator_data);
    }

    private async getValidatorByAddress(address: AddressHex) {
        const raw_validator_data = await this.level.get(address);
        return Validator.fromDecodedHex(raw_validator_data);
    }

    private async setValidator(index: Uint64, validator: Validator) {
        return this.level.put(this.getWithVPX(index), validator.encodeToHex());
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