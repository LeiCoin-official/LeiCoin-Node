
export class Staker {

    public readonly publicKey: string;
    public stake: string;

    constructor(publicKey: string, stake: string) {
        this.publicKey = publicKey;
        this.stake = stake;
    }

}

export default Staker;
