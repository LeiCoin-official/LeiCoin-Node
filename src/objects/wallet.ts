import encodingHandlers from "../handlers/encodingHandlers.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";

export class Wallet {

    public readonly owner: string;
    private balance: string;
    private nonce: string;
    public readonly version: string;

    constructor(owner: string, balance: string, nonce: string, verion = "00") {
        this.owner = owner;
        this.balance = balance;
        this.nonce = nonce;
        this.version = verion;
    }

    public static createEmptyWallet(owner: string) {
        return new Wallet(owner, "0", "0");
    }

    public encodeToHex(add_empty_bytes = true) {
    
        const encoded_balance = encodingHandlers.compressZeros(this.balance.toString());
        const balance_length = encoded_balance.length.toString().padStart(2, "0");
    
        const encoded_nonce = encodingHandlers.compressZeros(this.nonce.toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        const hexData = this.version + 
                        balance_length + 
                        encoded_balance + 
                        nonce_length + 
                        encoded_nonce;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;
    
    }
    
    public static fromDecodedHex(ownerAddress: string, hexData: string) {

        try {

            const resultData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "balance_length", length: 2},
                {key: "balance", length: "balance_length"},
                {key: "nonce_length", length: 2},
                {key: "nonce", length: "nonce_length"},
            ]);

            const data = resultData.data;
        
            if (data && data.version === "00") {
                data.balance = encodingHandlers.decompressZeros(data.balance);
                data.nonce = encodingHandlers.decompressZeros(data.nonce);

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

    public adjustNonce() {
        this.nonce = BigNum.add(this.nonce, "1");
    }

}

export default Wallet;