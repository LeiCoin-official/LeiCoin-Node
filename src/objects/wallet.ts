export class Wallet {

    public readonly owner: string;
    private balance: bigint;
    private nonce: number;
    public version: string;

    constructor(owner: string, balance: bigint, nonce: number, verion = "00") {
        this.owner = owner;
        this.balance = balance;
        this.nonce = nonce;
        this.version = verion;
    }

    public static createEmptyWallet(owner: string) {
        return new Wallet(owner, BigInt(0), 0,);
    }

    public addMoney(amount: bigint) {
        this.balance += amount;
    }

    public getBalance() {
        return this.balance;
    }

    public subtractMoneyIFPossible(amount: bigint) {

        if (amount <= this.balance) {
            this.balance -= amount;
            return true;
        }
        return false;
    }

    public getNonce() {
        return this.nonce;
    }

    public adjustNonce() {
        this.nonce += 1;
    }

}

export default Wallet;