import { AddressHex } from "../objects/address.js";
import blockchain from "../storage/blockchain.js";
import { Uint, Uint64 } from "../utils/binary.js";


class VCommitteeMemberData {
    public hasVoted: boolean;
    constructor(hasVoted = false) {
        this.hasVoted = hasVoted;
    }
}

type VCommitteeAttesterList = Map<AddressHex, VCommitteeMemberData>;
type VCommitteeProposer = [AddressHex, VCommitteeMemberData];


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
        const proposer: VCommitteeProposer = [new AddressHex(members.shift() as Uint), new VCommitteeMemberData()];
        const attesters: VCommitteeAttesterList = new Map();
        for (const [i, address] of members.entries()) {
            attesters.set(new AddressHex(address), {hasVoted: false});
        }
        return new VCommittee(slotIndex, attesters, proposer);
    }

    public getAttesters(): VCommitteeAttesterList {
        return this.attesters;
    }

    public getAttesterData(address: AddressHex) {
        return this.attesters.get(address);
    }

    public isAttester(address: AddressHex) {
        for (const attester of this.attesters.keys()) {
            if (attester.eq(address)) {
                return true;
            }
        }
        return false;
    }

    public getProposer() {
        return this.proposer;
    }

    public isProposer(address: AddressHex) {
        return this.proposer[0].eq(address);
    }
}

export { VCommittee as ValidatorsCommittee };
export default VCommittee;

