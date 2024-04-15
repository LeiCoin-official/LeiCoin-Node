import EncodingUtils from "../handlers/encodingUtils.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";

export class Wallet {

    public readonly owner: string;
    private balance: string;
    private nonce: string;
    public readonly version: string;

    constructor(owner: string, balance: string, nonce: string, version = "00") {
        this.owner = owner;
        this.balance = balance;
        this.nonce = nonce;
        this.version = version;
    }

    public static createEmptyWallet(owner: string) {
        return new Wallet(owner, "0", "0");
    }

    public encodeToHex(add_empty_bytes = true) {
    
        const resultData = EncodingUtils.encodeObjectToHex(this, [
            {key: "version"},
            {key: "balance", lengthBefore: true, type: "bigint"},
            {key: "nonce", lengthBefore: true, type: "bigint"},
        ], add_empty_bytes);

        return resultData.data;

    }
    
    public static fromDecodedHex(ownerAddress: string, hexData: string) {

        try {

            const resultData = EncodingUtils.getObjectFromHex(hexData, [
                {key: "version"},
                {key: "balance", length: 2, lengthBefore: true, type: "bigint"},
                {key: "nonce", length: 2, lengthBefore: true, type: "bigint"},
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

    public addMoney(amount: string) {
        this.balance = BigNum.add(this.balance, amount);
    }

    public getBalance() {
        return this.balance;
    }

    public isSubtractMoneyPossible(amount: string) {
        if (BigNum.lessOrEqual(amount, this.balance)) {
            return true;
        }
        return false;
    }

    public subtractMoneyIFPossible(amount: string) {

        if (this.isSubtractMoneyPossible(amount)) {
            this.balance = BigNum.subtract(this.balance, amount);
        }
    }

    public getNonce() {
        return this.nonce;
    }

    public adjustNonce(add = "1") {
        this.nonce = BigNum.add(this.nonce, add);
    }

}

export default Wallet;