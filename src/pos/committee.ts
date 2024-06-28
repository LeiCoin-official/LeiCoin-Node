import { AddressHex } from "../objects/address.js";
import Attestation from "../objects/attestation.js";
import blockchain from "../storage/blockchain.js";
import { Uint, Uint64 } from "../utils/binary.js";
import { Dict } from "../utils/dataUtils.js";

export type AttestationListAll = (Attestation | null)[];
export type AttestationListSorted = {
    agreed: Attestation[];
    disagreed: Attestation[];
    missing: AddressHex[];
}


export class VCAttester {

    public readonly address: AddressHex;
    public attestation: Attestation | null;

    constructor(address: AddressHex, attestation: Attestation | null = null) {
        this.address = address;
        this.attestation = attestation;
    }

}

export class VCProposer {

    public readonly address: AddressHex;
    public proposed: boolean = false;

    constructor(address: AddressHex) {
        this.address = address;
    }

}


export class VCommittee {

    private readonly attesters: VCAttester[];
    private readonly proposer: VCProposer;

    private readonly size: number;

    private constructor(attesters: VCAttester[], proposer: VCProposer) {
        this.attesters = attesters;
        this.proposer = proposer;
        this.size = attesters.length;
    }

    public static async create(slotIndex: Uint64) {
        const members = await blockchain.validators.selectNextValidators(slotIndex);

        const proposer = new VCProposer(new AddressHex(members.shift() as Uint));
        const attesters = members.map((address) => new VCAttester(new AddressHex(address)));

        return new VCommittee(attesters, proposer);
    }

    public getAllAttesters() {
        return this.attesters;
    }
    
    public getAllAttestations(sort?: "all"): (Attestation | null)[];
    public getAllAttestations(sort: "split"): {agreed: Attestation[]; disagreed: Attestation[]; missing: AddressHex[]}
    public getAllAttestations(sort: "all" | "split" = "all") {
        switch (sort) {
            case "all": {
                return this.attesters.map((attester) => attester.attestation);
            }
            case "split": {

                const agreed: Attestation[] = [];
                const disagreed: Attestation[] = [];
                const missing: AddressHex[] = [];

                for (const attester of this.attesters) {
                    if (!attester.attestation) {
                        missing.push(attester.address);
                        continue;
                    }
                    attester.attestation.vote ?
                        agreed.push(attester.attestation) :
                        disagreed.push(attester.attestation);
                }

                return { agreed, disagreed, missing };

            }
        }
    }

    public getAttester(address: AddressHex) {
        return this.attesters.find((attester) => attester.address.eq(address));
    }

    public isAttester(address: AddressHex) {
        return this.attesters.some((attester) => attester.address.eq(address));
    }

    public getProposer() {
        return this.proposer;
    }

    public isProposer(address: AddressHex) {
        return this.proposer.address.eq(address);
    }


    /** Returns the number of Attesters */
    public getSize() {
        return this.size;
    }
}

export { VCommittee as ValidatorsCommittee };
export default VCommittee;

