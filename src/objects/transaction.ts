export interface TXInput {
    utxoid: string;
}

export interface TXOutput {
    recipientAddress: string;
    amount: number;
}

export class Transaction {

    public txid: string;
    public senderAddress: string;
    public publicKey: string;
    public input: TXInput[];
    public output: TXOutput[];
    public signature: string;

    constructor(txid: string, senderAddress: string, publicKey: string, input: TXInput[], output: TXOutput[], signature: string) {
        this.txid = txid;
        this.senderAddress = senderAddress;
        this.publicKey = publicKey;
        this.output = output;
        this.input = input;
        this.signature = signature;
    }
}

export default Transaction;