import { AddressHex } from "../objects/address.js";
import Attestation from "../objects/attestation.js";
import { type Block } from "../objects/block.js";
import { type Proposition } from "../objects/proposition.js";
import blockchain from "../storage/blockchain.js";
import { Uint64 } from "../utils/binary.js";
import Constants from "../utils/constants.js";
import Schedule from "../utils/schedule.js";
import validator from "../validator/index.js";
import { AttesterJob, ProposerJob } from "../validator/jobs.js";
import VCommittee from "./committee.js";
import { Execution } from "./execution.js";
import POS from "./index.js";

export class Slot {

    public readonly index: Uint64;
    public readonly committee: VCommittee;

    public block: Block | null = null;

    public readonly blockSendStep: Schedule;
    public readonly blockReceivedStep: Schedule;
    public readonly blockFinalizedStep: Schedule;

    private constructor(index: Uint64, committee: VCommittee) {
        this.index = index;
        this.committee = committee;

        this.blockSendStep = new Schedule(async()=>{this.onBlockSend()}, 5_000);
        this.blockReceivedStep = new Schedule(async()=>{this.onBlockReceived(null)}, 10_000);
        this.blockFinalizedStep = new Schedule(async()=>{this.onBlockFinalized()}, 15_000);
    }

    public static async create(index: Uint64) {
        const committee = await VCommittee.create(index);
        return new Slot(index, committee);
    }


    private async onBlockSend() {
        if (this.blockSendStep.hasFinished()) { return; }
        this.blockSendStep.cancel();

        for (const staker of validator.stakers) {
            if (this.committee.isProposer(staker.address)) {
                ProposerJob.propose(staker);
                break;
            }
        }
    }

    private async onBlockReceived(proposition: Proposition | null) {
        this.blockReceivedStep.cancel();

        if (proposition) this.block = proposition.block;

        for (const staker of validator.stakers) {
            if (this.committee.isAttester(staker.address)) {
                AttesterJob.attest(proposition, staker);
            }
        }
    }

    private async onBlockFinalized() {
        this.blockFinalizedStep.cancel();
        
        const {agreed, disagreed, missing} = this.committee.getAllAttestations("split");

        // implemenzing inactivity penalty here later

        //if (agreed.length >= 2/3 * this.committee.getSize()) 

        if (this.block) {
            
            const valid_status = (await Execution.executeBlock(this.block)).status;
            
            if (valid_status === 12000) {
                // reward those who agreed with the proposed block and slash those who disagreed
                POS.watingAttestations.push(...agreed);
                POS.watingAttesterSlashings.push(...disagreed);
                return;
            }

        }

        // reward those who disagreed with the not proposed block and slash those who agreed
        POS.watingAttestations.push(...disagreed);
        POS.watingAttesterSlashings.push(...agreed);

    }


    public processProposition(proposition: Proposition) {
        if (this.blockReceivedStep.hasFinished()) {
            return;
        }
        
        this.committee.getProposer().proposed = true;

        this.onBlockReceived(false, proposition);
    }

    public processAttestation(attestation: Attestation) {
        if (this.blockFinalizedStep.hasFinished()) {
            return;
        }

        this.committee.getAttester(attestation.attester)!.attestation = attestation;
    }

}

export default Slot;
