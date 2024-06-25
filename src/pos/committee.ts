import { AddressHex } from "../objects/address.js";
import blockchain from "../storage/blockchain.js";
import { Uint, Uint64 } from "../utils/binary.js";
import { Dict } from "../utils/dataUtils.js";


abstract class VCommitteeMemberData {

    public readonly nonce: Uint64;
    //public readonly slashVotes: string[] = [];

    constructor(nonce = Uint64.from(0)) {
        this.nonce = nonce;
    }
}

class VCommitteeAttesterData extends VCommitteeMemberData {
    public vote: "agree" | "disagree" | "none" = "none";
    public late_vote = false;
}

class VCommitteeProposerData extends VCommitteeMemberData {
    public proposed = false;
}


type VCommitteeAttesterList = Dict<VCommitteeAttesterData>;
type VCommitteeProposer = [string, VCommitteeProposerData];


export class VCommittee {

    private readonly attesters: VCommitteeAttesterList;
    private readonly proposer: VCommitteeProposer;
    private readonly size: number;

    private constructor(attesters: VCommitteeAttesterList, proposer: VCommitteeProposer) {
        this.attesters = attesters;
        this.proposer = proposer;
        this.size = Object.keys(attesters).length + 1;
    }

    public static async create(slotIndex: Uint64) {
        const members = await blockchain.validators.selectNextValidators(slotIndex);
        const proposer: VCommitteeProposer = [(members.shift() as Uint).toHex(), new VCommitteeProposerData()];
        const attesters: VCommitteeAttesterList = {};
        for (const [, address] of members.entries()) {
            attesters[new AddressHex(address).toHex()] = new VCommitteeAttesterData();
        }
        return new VCommittee(attesters, proposer);
    }

    public getMemberData(address: AddressHex) {
        return this.attesters[address.toHex()] || this.proposer[1];
    }

    public getAttesters() {
        return this.attesters;
    }

    public getAttesterData(address: AddressHex) {
        return this.attesters[address.toHex()];
    }

    public isAttester(address: AddressHex) {
        return address.toHex() in this.attesters;
    }

    public getProposer() {
        return this.proposer;
    }

    public getProposerData() {
        return this.proposer[1];
    }

    public isProposer(address: AddressHex) {
        return this.proposer[0] === address.toHex();
    }

    public getSize() {
        return this.size;
    }
}

export { VCommittee as ValidatorsCommittee };
export default VCommittee;

