import utils from "../utils/utils.js";

// export interface TXInputLike {
export interface TXInput {
    utxoid: string;
}

// export interface TXOutputLike {
export interface TXOutput {
    recipientAddress: string;
    amount: number;
}

export interface TransactionLike {

    txid: string;
    senderAddress: string;
    publicKey: string;
    input: TXInput[];
    output: TXOutput[];
    signature: string;
    coinbase?: boolean;

}

// export class TXInput implements TXInputLike {

//     public utxoid: string;

//     constructor(utxoid: string) {
//         this.utxoid = utxoid;
//     }

//     public toDeletedUTXO() {
//         return new 
//     }

// }

// export class TXOutput implements TXOutputLike {

//     public recipientAddress: string;
//     public amount: number;

//     constructor(recipientAddress: string, amount: number) {
//         this.recipientAddress = recipientAddress;
//         this.amount = amount;
//     }
// }


export class Transaction implements TransactionLike {

    public txid: string;
    public senderAddress: string;
    public publicKey: string;
    public input: TXInput[];
    public output: TXOutput[];
    public signature: string;
    public coinbase?: boolean;

    constructor(txid: string, senderAddress: string, publicKey: string, input: TXInput[], output: TXOutput[], signature: string, coinbase?: boolean) {
        this.txid = txid;
        this.senderAddress = senderAddress;
        this.publicKey = publicKey;
        this.output = output;
        this.input = input;
        this.signature = signature;
        if (coinbase) {
            this.coinbase = coinbase;
        }
    }

    public static initFromJSON(preset: TransactionLike) {
        return utils.createInstanceFromJSON(Transaction, preset);
    }

}

export default Transaction;