import { AddressHex } from "../objects/address.js";
import Validator, { ValidatorAddress } from "../objects/validator.js";
import blockchain from "../storage/blockchain.js";
import { Uint } from "../utils/binary.js";


export class DepositContract {

    private static loaded = false;

    private static readonly address = AddressHex.from("0c0000000000000000000000000000000000000001");

    private static rawDataLength = 29;

    public static async load() {
        if (this.loaded) return;

        

        this.loaded = true;
    }

    private static async readDB() {
        this.data = (await blockchain.cstates.getState(this.address)).split(this.rawDataLength);
    }

    private static async saveDB() {
        return blockchain.cstates.setState(this.address, Uint.concat(this.data));
    }

    private static getDataByAddress(address: ValidatorAddress) {
        return this.data.find((item) => item.slice(1, 21).eq(address));
    }

    private static getIndexByAddress(address: ValidatorAddress) {
        return this.data.findIndex((item) => item.slice(1, 21).eq(address));
    }

    public static getValidator(address: ValidatorAddress) {
        const data = this.getDataByAddress(address);
        if (data) return Validator.fromDecodedHex(data);
        return null;
    }

    public static setValidator(validator: Validator) {
        const index = this.getIndexByAddress(validator.address);
        if (index === -1)
            this.data.push(validator.encodeToHex());
        else
            this.data[index] = validator.encodeToHex();
    }

}

export default DepositContract;
