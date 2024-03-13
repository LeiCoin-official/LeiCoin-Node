import Staker from "../objects/staker.js";

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

}

const stakerpool = Stakerpool.getInstance();
export default stakerpool;
