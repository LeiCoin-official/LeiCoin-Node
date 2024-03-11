
export class Staker {

    public readonly address: string;
    public stake: string;

    constructor(address: string, stake: string) {
        this.address = address;
        this.stake = stake;
    }

}

export default Staker;
