import utils from "../utils/index.js";
import stakerpool from "./stakepool.js";

export interface CommitteeMemberList {
    [publicKey: string]: {
        stake: string;
        nonce: string;
    };
}

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
    private members: CommitteeMemberList;

    private constructor() {
        //this.currentSlot = "0";
        this.nextProposer = "";
        this.members = {};
    }

    public setMembers(committee: CommitteeMemberList) {
        this.members = committee;
    }

    public getMembers() {
        return this.members;
    }

    public getMember(publicKey: string) {
        return this.members[publicKey];
    }

    public isMember(publicKey: string) {
        return this.members[publicKey] ? true : false;
    }

    public createNewCommittee(lastBlockHash: string) {
        this.members = stakerpool.calculateNextValidators(lastBlockHash);
    }

    public calculateNextProposer(hash: string) {
        const validatorsArray = Object.entries(utils.sortObjectAlphabetical(this.members));

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
