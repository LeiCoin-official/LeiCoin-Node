import { AddressHex } from "../objects/address.js";
import blockchain from "../storage/blockchain.js";
import { Uint, Uint64 } from "../utils/binary.js";
import { Dict } from "../utils/dataUtils.js";


class VCommitteeMemberData {
    public hasVoted: boolean;
    constructor(hasVoted = false) {
        this.hasVoted = hasVoted;
    }
}

type VCommitteeAttesterList = Dict<VCommitteeMemberData>;
type VCommitteeProposer = [string, VCommitteeMemberData];


export class VCommittee {

    private readonly slotIndex: Uint64;
    private readonly attesters: VCommitteeAttesterList;
    private readonly proposer: VCommitteeProposer;

    private constructor(slotIndex: Uint64, attesters: VCommitteeAttesterList, proposer: VCommitteeProposer) {
        this.slotIndex = slotIndex;
        this.attesters = attesters;
        this.proposer = proposer;
    }

    public static async create(slotIndex: Uint64) {
        const members = await blockchain.validators.selectNextValidators(slotIndex);
        const proposer: VCommitteeProposer = [(members.shift() as Uint).toHex(), new VCommitteeMemberData()];
        const attesters: VCommitteeAttesterList = {};
        for (const [i, address] of members.entries()) {
            attesters[new AddressHex(address).toHex()] = {hasVoted: false};
        }
        return new VCommittee(slotIndex, attesters, proposer);
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

    public isProposer(address: AddressHex) {
        return this.proposer[0] === address.toHex();
    }
}

export { VCommittee as ValidatorsCommittee };
export default VCommittee;

