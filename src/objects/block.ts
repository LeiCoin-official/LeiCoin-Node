class Block {

    public index: Number;
    public hash: String;
    public previousHash: String;
    public timestamp: Number;
    public nonce: Number;
    public transactions: Map<String, Transaction>;
    public coinbase: {minerAddress: String, amount: Number};

    constructor(index: Number, hash: String, previousHash: String, timestamp: Number, transactions: Map<String, Transaction>, coinbase: {minerAddress: String, amount: Number}) {

    }

    public static createBlock() {

    }

}