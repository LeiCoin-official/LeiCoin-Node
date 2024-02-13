import { TXInput, TXOutput } from "./transaction";

export class DeletedUTXO {

    constructor() {
        
    }

    public static initFromTXInput(input: TXInput) {
        return new DeletedUTXO();
    }

}

export class AddedUTXO {

    public amount: number;

    constructor(
        amount: number
    ) {
        this.amount = amount;
    }

    public static initFromTXOutput(output: TXOutput) {
        return new AddedUTXO(output.amount); //
    }

}

export class UTXO {

    public recipientAddress: string;
    public utxoid: string;
    public amount: number;
    
    constructor(
        recipientAddress: string,
        utxoid: string,
        amount: number
    ) {
        this.recipientAddress = recipientAddress;
        this.utxoid = utxoid;
        this.amount = amount;
    }

}

export default UTXO;