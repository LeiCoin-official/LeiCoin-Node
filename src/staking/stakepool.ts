import Staker from "../objects/staker.js";

export class Stakerpool {

    private static instance: Stakerpool;

    public static getInstance() {
        if (!Stakerpool.instance) {
            Stakerpool.instance = new Stakerpool();
        }
        return Stakerpool.instance;
    }

    private validators: Array<Staker>;

    public nextStaker: Staker;

    private constructor() {
        this.validators = [];
    }

    public getNextStaker(hash: string) {

        const idealScores: number[] = [];
    
        const bestScoreDifferences: number[] = [];
        let nextStaker = this.validators[0];
    
        for (let i = 0; i < hash.length; i++) {
            const charCode = hash.charCodeAt(i);
            idealScores.push(charCode);
            bestScoreDifferences.push(128);
        }
    
        for (const staker of this.validators) {

            const address = staker.address;
    
            for (let i = 0; i < idealScores.length; i++) {
                
                const scoreDifference = Math.abs(idealScores[i] - address.charCodeAt(0));
    
                if (scoreDifference == bestScoreDifferences[i]) {
                    bestScoreDifferences[i] = scoreDifference;
                } else if (scoreDifference < bestScoreDifferences[i]) {
                    bestScoreDifferences[i] = scoreDifference;
                    nextStaker = staker;
                } else {
                    break;
                }
    
            }
    
        }
        
        this.nextStaker = nextStaker;
        return nextStaker;
    
    }

}

export default Stakerpool;
