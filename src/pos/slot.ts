import { AddressHex } from "../objects/address.js";
import Attestation from "../objects/attestation.js";
import { type Block } from "../objects/block.js";
import { type Proposition } from "../objects/proposition.js";
import Reward from "../objects/reward.js";
import Slashing from "../objects/slashing.js";
import blockchain from "../storage/blockchain.js";
import { Uint64 } from "../utils/binary.js";
import Constants from "../utils/constants.js";
import Schedule from "../utils/schedule.js";
import validator from "../validator/index.js";
import { AttesterJob, ProposerJob } from "../validator/jobs.js";
import VCommittee from "./committee.js";
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

        const agreeVotes = Object.entries(this.committee.getAttesters()).filter(data => data[1].vote === "agree");
        const disagreeVotes = Object.entries(this.committee.getAttesters()).filter(data => data[1].vote === "disagree");
        const noneVotes = Object.entries(this.committee.getAttesters()).filter(data => data[1].vote === "none");

        const reward_amount = Uint64.from(Constants.STAKE_REWARD);
        const slashing_amount = Uint64.from(Constants.SLASHING_AMOUNT)

        POS.watingSlashings.push(...noneVotes.map(data => 
            new Slashing(AddressHex.from(data[0]), slashing_amount)
        ));

        if (((agreeVotes.length + 1) >= 2/3 * this.committee.getSize()) && this.block) {
            
            blockchain.blocks.addBlock(this.block);

            POS.watingRewards.push(...agreeVotes.map(data => 
                new Reward(AddressHex.from(data[0]), slashing_amount)
            ));
            POS.watingSlashings.push(...disagreeVotes.map(data => 
                new Slashing(AddressHex.from(data[0]), slashing_amount)
            ));

        } else {
            POS.watingRewards.push(...disagreeVotes.map(data => 
                new Reward(AddressHex.from(data[0]), slashing_amount)
            ));
            POS.watingSlashings.push(...agreeVotes.map(data => 
                new Slashing(AddressHex.from(data[0]), slashing_amount)
            ));
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
