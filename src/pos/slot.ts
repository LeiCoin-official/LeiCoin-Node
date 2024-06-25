import Attestation from "../objects/attestation.js";
import Block from "../objects/block.js";
import Proposition from "../objects/proposition.js";
import blockchain from "../storage/blockchain.js";
import { Uint64 } from "../utils/binary.js";
import Schedule from "../utils/schedule.js";
import validator from "../validator/index.js";
import { AttesterJob, ProposerJob } from "../validator/jobs.js";
import VCommittee from "./committee.js";

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
        this.blockReceivedStep = new Schedule(async()=>{this.onBlockReceived(true)}, 10_000);
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

    private async onBlockReceived(timeout: boolean, proposition?: Proposition) {
        this.blockReceivedStep.cancel();       
        if (timeout || !proposition?.block) {
            return;
        }

        this.block = proposition.block;

        for (const staker of validator.stakers) {
            if (this.committee.isAttester(staker.address)) {
                AttesterJob.attest(proposition, staker);
            }
        }
    }

    private async onBlockFinalized() {
        this.blockFinalizedStep.cancel();

        const agreeVotes = Object.values(this.committee.getAttesters()).filter(data => data.vote === "agree");
        const disagreeVotes = Object.values(this.committee.getAttesters()).filter(data => data.vote === "disagree");
        const noneVotes = Object.values(this.committee.getAttesters()).filter(data => data.vote === "none");

        if (((agreeVotes.length + 1) >= 2/3 * this.committee.getSize()) && this.block) {
            
            blockchain.blocks.addBlock(this.block);

        } else {

            

        }
    }


    public processProposition(proposition: Proposition) {
        if (this.blockReceivedStep.hasFinished()) {
            return;
        }
        
        this.committee.getProposerData().proposed = true;

        this.onBlockReceived(false, proposition);
    }

    public processAttestation(attestation: Attestation) {
        if (this.blockFinalizedStep.hasFinished()) {
            return;
        }
        const attester = this.committee.getAttesterData(attestation.attester);
        attester.vote = attestation.vote ? "agree" : "disagree";
        attester.nonce.iadd(1);
    }

}

export default Slot;
