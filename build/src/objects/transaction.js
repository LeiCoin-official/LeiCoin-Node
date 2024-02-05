export class Transaction {
    constructor(txid, senderAddress, publicKey, input, output, signature) {
        this.txid = txid;
        this.senderAddress = senderAddress;
        this.publicKey = publicKey;
        this.output = output;
        this.input = input;
        this.signature = signature;
    }
}
export default Transaction;
