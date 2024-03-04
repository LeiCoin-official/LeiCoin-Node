import encodingHandlers from "../handlers/encodingHandlers";

export class Wallet {

    public readonly owner: string;
    private balance: bigint;
    private nonce: number;
    public readonly version: string;

    constructor(owner: string, balance: bigint, nonce: number, verion = "00") {
        this.owner = owner;
        this.balance = balance;
        this.nonce = nonce;
        this.version = verion;
    }

    public static createEmptyWallet(owner: string) {
        return new Wallet(owner, BigInt(0), 0,);
    }

    public encodeToHex() {
    
        const encoded_balance = encodingHandlers.compressZeros(this.balance.toString());
        const balance_length = encoded_balance.length.toString().padStart(2, "0");
    
        const encoded_nonce = encodingHandlers.compressZeros(this.nonce.toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        const hexData = this.version + 
                        balance_length + 
                        encoded_balance + 
                        nonce_length + 
                        encoded_nonce;

        const empty_bytes = hexData.length % 2 !== 0 ? "0" : "";
        
        return hexData + empty_bytes;
    
    }
    
    public static fromDecodedHex(ownerAddress: string, hexData: string) {

        const version = hexData.substring(0, 2);
    
        if (version === "00") {
    
            const balance_length_string = hexData.substring(2, 4);
            const balance_length = parseInt(balance_length_string);

            const raw_balance = hexData.substring(4, 4 + balance_length);
            const decoded_balance = BigInt(encodingHandlers.decompressZeros(raw_balance));
    
            const nonce_length_string = hexData.substring(4 + balance_length, 6 + balance_length);
            const nonce_length = parseInt(nonce_length_string);

            const raw_nonce = hexData.substring(6 + balance_length, 6 + balance_length + nonce_length);
            const decoded_nonce = parseInt(raw_nonce);
                
            if (
                (version.length !== 2) ||
                (balance_length_string.length !== 2) ||
                (raw_balance.length !== balance_length) ||
                (nonce_length_string.length !== 2) ||
                (raw_nonce.length !== nonce_length)
            ) {
                return Wallet.createEmptyWallet(ownerAddress);
            }

            return new Wallet(ownerAddress, decoded_balance, decoded_nonce, version);
        }

        return Wallet.createEmptyWallet(ownerAddress);
    }

    public addMoney(amount: bigint) {
        this.balance += amount;
    }

    public getBalance() {
        return this.balance;
    }

    public isSubtractMoneyPossible(amount: bigint) {
        if (amount <= this.balance) {
            return true;
        }
        return false;
    }

    public subtractMoneyIFPossible(amount: bigint) {

        if (this.isSubtractMoneyPossible(amount)) {
            this.balance -= amount;
        }
    }

    public getNonce() {
        return this.nonce;
    }

    public adjustNonce() {
        this.nonce += 1;
    }

}

export default Wallet;