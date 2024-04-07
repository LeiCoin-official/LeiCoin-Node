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

    public getCurrentProposer() {
        return this.currentSlot?.proposer;
    }

    public isCurrentProposer(publicKey: string) {
        return this.currentSlot?.proposer === publicKey;
    }

    public isCurrentAttestor(publicKey: string) {
        return this.isMember(publicKey) && !this.isCurrentProposer(publicKey);
    }

    public getCurrentBlock() {
        return this.currentSlot?.block;
    }

    public setCurrentBlock(block: Block) {
        if (this.currentSlot) {
            this.currentSlot.block = block;
        } else {
            this.currentSlot = {block, proposer: block.proposer};
        }
    }
}

const validatorsCommittee = ValidatorsCommittee.getInstance();
export default validatorsCommittee;

/*
    private static currentCommittee: ValidatorsCommittee;
    private static previousCommittee: ValidatorsCommittee | null;

    public static getCurrentCommittee() {
        if (!this.currentCommittee) {
            this.currentCommittee = new ValidatorsCommittee();
        }
        return this.currentCommittee;
    }
    public static getCVC = this.getCurrentCommittee;

    public static getPreviousCommittee() {
        return this.previousCommittee;
    }
    public static getPVC = this.getPreviousCommittee;

*/