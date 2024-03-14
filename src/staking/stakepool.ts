import cryptoHandlers from "../handlers/cryptoHandlers.js";
import Staker from "../objects/staker.js";
import utils from "../utils/utils.js";

export interface StakersList {
    [address: string]: {
        stake: string;
    }
}

class Stakerpool {

    private static instance: Stakerpool;

    public static getInstance() {
        if (!Stakerpool.instance) {
            Stakerpool.instance = new Stakerpool();
        }
        return Stakerpool.instance;
    }

    private stakers: StakersList;

    public nextStaker: Staker;

    private constructor() {
        this.stakers = {};
        this.nextStaker = new Staker("", "");
    }

    public getNextStaker(hash: string) {
        this.nextStaker = this.calculateStaker(hash);
        return this.nextStaker;
    }

    public calculateStaker(hash: string) {
        const idealScores: number[] = [];
    
        const bestScoreDifferences: number[] = [];
        let nextStaker = this.nextStaker;
    
        for (let i = 0; i < hash.length; i++) {
            const charCode = hash.charCodeAt(i);
            idealScores.push(charCode);
            bestScoreDifferences.push(128);
        }
    
        for (const [address, data] of Object.entries(this.stakers)) {
    
            for (let i = 0; i < idealScores.length; i++) {
                
                const scoreDifference = Math.abs(idealScores[i] - address.charCodeAt(0));
    
                if (scoreDifference > bestScoreDifferences[i]) {
                    break;
                } else if (scoreDifference < bestScoreDifferences[i]) {
                    bestScoreDifferences[i] = scoreDifference;
                    nextStaker = new Staker(address, data.stake);
                }

            }
    
        }
        return nextStaker;
    }

    public calculateNextValidators(seedHash: string) {

        const validatorsArray = Object.entries(utils.sortObjectAlphabetical(this.stakers));

        const selected: StakersList = {};

        let nextHash = seedHash;

        for (let i = 0; i < 128; i++) {
            const index = parseInt((BigInt(`0x${nextHash}`) % BigInt(validatorsArray.length)).toString());

            selected[validatorsArray[index][0]] = validatorsArray[index][1];

            validatorsArray.splice(index, 1);

            nextHash = cryptoHandlers.sha256(nextHash);
        }

        return selected;

    }

}

const stakerpool = Stakerpool.getInstance();
export default stakerpool;
