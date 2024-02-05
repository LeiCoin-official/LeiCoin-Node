export class DeletedUTXO {
    constructor() {
    }
}
export class AddedUTXO extends DeletedUTXO {
    constructor(amount) {
        super();
        this.amount = amount;
    }
}
export class UTXO extends AddedUTXO {
    constructor(utxoid, recipientAddress, amount) {
        super(amount);
        this.utxoid = utxoid;
        this.recipientAddress = recipientAddress;
    }
}
export default UTXO;
