import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import { NumberLike, Uint, Uint64 } from "../utils/binary.js";
import cli from "../utils/cli.js";
import { AddressHex } from "./address.js";
import { PX } from "./prefix.js";

export class Wallet {

    public owner: AddressHex;
    private balance: Uint64;
    private nonce: Uint64;
    public version: PX;

    constructor(owner: AddressHex, balance: Uint64, nonce: Uint64, version = PX.V_00) {
        this.owner = owner;
        this.balance = balance;
        this.nonce = nonce;
        this.version = version;
    }

    public static createEmptyWallet(owner: AddressHex) {
        return new Wallet(owner, Uint64.alloc(), Uint64.alloc());
    }

    public encodeToHex() {
        return ObjectEncoding.encode(this, Wallet.encodingSettings, false).data;
    }
    
    public static fromDecodedHex(ownerAddress: AddressHex, hexData: Uint) {
        try {
            const resultData = ObjectEncoding.decode(hexData, Wallet.encodingSettings);
            const data = resultData.data;

            if (data && data.version.eq(0)) {
                return new Wallet(ownerAddress, data.balance, data.nonce, data.version);
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Wallet from Decoded Hex: ${err.message}`);
        }
        return null;
    }

    private static encodingSettings: EncodingSettings[] = [
        {key: "version"},
        {key: "balance", type: "bigint"},
        {key: "nonce"},
    ]

    public addMoney(amount: NumberLike) {
        this.balance.iadd(amount);
    }

    public getBalance() {
        return this.balance;
    }

    public isSubtractMoneyPossible(amount: NumberLike) {
        return this.balance.gte(amount);
    }

    public subtractMoneyIFPossible(amount: NumberLike) {
        if (this.isSubtractMoneyPossible(amount)) {
            this.balance.isub(amount);
        }
    }

    public getNonce() {
        return this.nonce;
    }

    public adjustNonce(height = 1) {
        this.nonce.iadd(height);
    }

}

export default Wallet;
