export class DeletedUTXO {

    public utxoid: string;

    constructor(
        utxoid: string,
    ) {
        this.utxoid = utxoid;
    }

    public static fromName(utxoid: string) {
        return new DeletedUTXO(utxoid)
    }

}

export class AddedUTXO extends DeletedUTXO {

    public amount: number;

    constructor(
        utxoid: string,
        amount: number
    ) {
        super(utxoid);
        this.amount = amount;
    }

}

export class UTXO extends AddedUTXO {

    
    public recipientAddress: string;
    
    constructor(
        utxoid: string,
        recipientAddress: string,
        amount: number
    ) {
        super(utxoid, amount);
        this.recipientAddress = recipientAddress;
    }

}

export default UTXO;