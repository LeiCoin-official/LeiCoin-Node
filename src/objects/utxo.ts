export class DeletedUTXO {

    constructor() {
        
    }

}

export class AddedUTXO extends DeletedUTXO {

    public amount: number;

    constructor(
        amount: number
    ) {
        super();
        this.amount = amount;
    }

}

export class UTXO extends AddedUTXO {

    public recipientAddress: string;
    public utxoid: string;
    
    constructor(
        utxoid: string,
        recipientAddress: string,
        amount: number
    ) {
        super(amount);
        this.utxoid = utxoid;
        this.recipientAddress = recipientAddress;
    }

}

export default UTXO;