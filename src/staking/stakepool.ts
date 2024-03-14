import cryptoHandlers from "../handlers/cryptoHandlers.js";
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

    public calculateNextValidators(seedHash: string) {

        const comparingData: {
            idealScores: number[],
            bestScoreDifferences: number[],
            nextValidator: Staker,
        }[] = [];
        
        for (let validatorIndex = 0; validatorIndex < 128; validatorIndex++) {

            const nextHash = cryptoHandlers.sha256(seedHash + validatorIndex.toString());

            const idealScores: number[] = [];
            const bestScoreDifferences: number[] = [];

            for (let hashCharIndex = 0; hashCharIndex < nextHash.length; hashCharIndex++) {
                const charCode = nextHash.charCodeAt(hashCharIndex);
                idealScores.push(charCode);
                bestScoreDifferences.push(128);
            }

            comparingData.push({
                idealScores,
                bestScoreDifferences,
                nextValidator: new Staker("", "")
            });

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
