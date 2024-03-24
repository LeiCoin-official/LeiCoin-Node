import Block from "../objects/block.js";
import BigNum from "../utils/bigNum.js";
import utils from "../utils/index.js";
import stakerpool from "./stakepool.js";

interface CurrentSlot {
    //index: string;
    proposer: string;
    block: Block | null;
}

export class CommitteeMember {

    public stake: string;
    public nonce: string;

    constructor(stake: string, nonce: string) {
        this.stake = stake;
        this.nonce = nonce;
    }

    public static create(stake: string) {
        return new CommitteeMember(stake, "0");
    }

    public adjustNonce() {
        this.nonce = BigNum.add(this.nonce, 1);
    }

}

export interface CommitteeMemberList {
    [publicKey: string]: CommitteeMember;
}

class ValidatorsCommittee {

    private static instance: ValidatorsCommittee;

    public static getInstance() {
        if (!ValidatorsCommittee.instance) {
            ValidatorsCommittee.instance = new ValidatorsCommittee();
        }
        return ValidatorsCommittee.instance;
    }

    private currentSlot: CurrentSlot | null = null;
    private members: CommitteeMemberList;

    private constructor() {
        this.currentSlot = null;
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
        this.currentSlot = {
            proposer: validatorsArray[index][0],
            block: null
        };

        return validatorsArray[index][0];
    }

    public getCurrentProposer() {
        return this.currentSlot?.proposer;
    }

    public isCurrentProposer(publicKey: string) {
        return this.currentSlot?.proposer === publicKey;
    }

    public isCurrentAttestor(publicKey: string) {
        return this.isMember(publicKey) && !this.isCurrentProposer(publicKey);
    }

}

const validatorsCommittee = ValidatorsCommittee.getInstance();
export default validatorsCommittee;
