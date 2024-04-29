import EncodingUtils from "../handlers/encodingUtils.js";
import { NumberLike, Uint64, Uint8 } from "../utils/binary.js";
import cli from "../utils/cli.js";
import { AddressHex } from "./address.js";

export class Wallet {

    public owner: AddressHex;
    private balance: Uint64;
    private nonce: Uint64;
    public version: Uint8;

    constructor(owner: AddressHex, balance: Uint64, nonce: Uint64, version = Uint8.alloc()) {
        this.owner = owner;
        this.balance = balance;
        this.nonce = nonce;
        this.version = version;
    }

    public static createEmptyWallet(owner: AddressHex) {
        return new Wallet(owner, Uint64.alloc(), Uint64.alloc());
    }

    public encodeToHex(add_empty_bytes = true) {
    
        const resultData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "balance", type: "bigintWithLenPrefix"},
            {key: "nonce"},
        ], add_empty_bytes);

        return resultData.data;

    }
    
    public static fromDecodedHex(ownerAddress: AddressHex, hexData: string) {

        try {

            const resultData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "balance", type: "bigintWithLenPrefix"},
                {key: "nonce"},
            ]);

            const data = resultData.data;
        
            if (data && data.version === "00") {
                return new Wallet(ownerAddress, data.balance, data.nonce, data.version);
            }

        } catch (err: any) {
            cli.data_message.error(`Error loading Wallet from Decoded Hex: ${err.message}`);
        }
        
        return null;
    }

    public addMoney(amount: NumberLike) {
        this.balance.add(amount);
    }

    public getBalance() {
        return this.balance;
    }

    public isSubtractMoneyPossible(amount: NumberLike) {
        return this.balance.gte(amount);
    }

    public subtractMoneyIFPossible(amount: NumberLike) {
        if (this.isSubtractMoneyPossible(amount)) {
            this.balance.sub(amount);
        }
    }

    public getNonce() {
        return this.nonce;
    }

    public adjustNonce(height = 1) {
        this.nonce.add(height);
    }

}

export default Wallet;