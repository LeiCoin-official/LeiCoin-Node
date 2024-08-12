import Minter from "../objects/minter.js";
import Block from "../objects/block.js";
import { AddressHex } from "../objects/address.js";
import { Uint, Uint64 } from "../utils/binary.js";
import Crypto from "../crypto/index.js";
import { LevelBasedStorage } from "./storageTypes.js";
import { PX } from "../objects/prefix.js";

export class MinterDB extends LevelBasedStorage {

    protected path = "/validators";

    public async getAllVAddresses() {
        return this.level.keys().all();
    }

    public async getMinter(address: AddressHex) {
        const raw_minter_data = await this.level.get(address);
        return Minter.fromDecodedHex(address, raw_minter_data);
    }

    public async setMinter(minter: Minter) {
        return this.level.put(minter.address, minter.encodeToHex());
    }

    public async removeMinter(minter: Minter) {
        return this.level.del(minter.address);
    }

    private async adjustStakeByBlock(block: Block) {
        
        //const inActive = this.getMinterInLevel(address, "active");

    }

    public async selectNextMinter(slot: Uint64) {
        const slotHash = Uint.concat([
            PX.A_0e,
            Crypto.sha256(slot).split(21)[0]
        ]);
        return new AddressHex(
            (await this.level.keys({gte: slotHash, limit: 1}).all())[0] ||
            (await this.level.keys({lte: slotHash, limit: 1, reverse: true}).all())[0]
        );
    }

}

export default MinterDB;