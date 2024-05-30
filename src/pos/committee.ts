import { AddressHex } from "../objects/address.js";
import blockchain from "../storage/blockchain.js";
import { Uint, Uint64 } from "../utils/binary.js";
import { Dict } from "../utils/dataUtils.js";


class VCommitteeMemberData {

    public nonce: Uint64;
    public vote: "agree" | "disagree" | "none" = "none";
    public readonly slashVotes: string[] = [];

    constructor(nonce = Uint64.from(0)) {
        this.nonce = nonce;
    }
}

type VCommitteeAttesterList = Dict<VCommitteeMemberData>;
type VCommitteeProposer = [string, VCommitteeMemberData];


export class VCommittee {

    private readonly attesters: VCommitteeAttesterList;
    private readonly proposer: VCommitteeProposer;

    private constructor(attesters: VCommitteeAttesterList, proposer: VCommitteeProposer) {
        this.attesters = attesters;
        this.proposer = proposer;
    }

    public static async create(slotIndex: Uint64) {
        const members = await blockchain.validators.selectNextValidators(slotIndex);
        const proposer: VCommitteeProposer = [(members.shift() as Uint).toHex(), new VCommitteeMemberData()];
        const attesters: VCommitteeAttesterList = {};
        for (const [, address] of members.entries()) {
            attesters[new AddressHex(address).toHex()] = new VCommitteeMemberData();
        }
        return new VCommittee(attesters, proposer);
    }

    public getMemberData(address: AddressHex) {
        return this.attesters[address.toHex()] || this.proposer[1];
    }

    public getAttesters(): VCommitteeAttesterList {
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
}

export { VCommittee as ValidatorsCommittee };
export default VCommittee;

