class Transaction {

    public txid: string;
    public senderAddress;
    public publicKey;
    public output;
    public input;
    public signature;

    constructor(txid: string, senderAddress: string, publicKey: string, output, input, signature) {
        
    }
}

export default Transaction;