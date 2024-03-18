import utils from "../utils/utils";
import stakerpool, { StakersList } from "./stakepool";

class ValidatorsCommittee {

    private static instance: ValidatorsCommittee;

    public static getInstance() {
        if (!ValidatorsCommittee.instance) {
            ValidatorsCommittee.instance = new ValidatorsCommittee();
        }
        return ValidatorsCommittee.instance;
    }

    //private currentSlot: string;
    private nextProposer: string;
    private validators: StakersList;

    private constructor() {
        //this.currentSlot = "0";
        this.nextProposer = "";
        this.validators = {};
    }

    public setValidators(committee: StakersList) {
        this.validators = committee;
    }

    public getValidators() {
        return this.validators;
    }

    public createNewCommittee(lastBlockHash: string) {
        this.validators = stakerpool.calculateNextValidators(lastBlockHash);
    }

    public calculateNextProposer(hash: string) {
        const validatorsArray = Object.entries(utils.sortObjectAlphabetical(this.validators));

        const index = parseInt((BigInt(`0x${hash}`) % BigInt(validatorsArray.length)).toString());
        this.nextProposer = validatorsArray[index][0];

        return validatorsArray[index][0];
    }

    public getNextProposer() {
        return this.nextProposer;
    }

}

const validatorsCommittee = ValidatorsCommittee.getInstance();
export default validatorsCommittee;