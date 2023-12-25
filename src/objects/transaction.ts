class Transaction {

    public txid: string;
    public senderAddress: string;
    public publicKey: string;
    public output: Array<
        {
            recipientAddress: string,

        }
    >;
    public input: Array<>;
    public signature: string;

    constructor(txid: string, senderAddress: string, publicKey: string, output, input, signature: string) {
        this.txid = txid;
        this.senderAddress = senderAddress;
        this.publicKey = publicKey;
        this.output = output;
        this.input = input;
        this.signature = signature;
    }
}

export default Transaction;