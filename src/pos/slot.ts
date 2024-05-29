import Block from "../objects/block.js";
import { Uint64 } from "../utils/binary.js";
import Schedule from "../utils/schedule.js";
import VCommittee from "./committee.js";

export class Slot {

    public readonly index: Uint64;
    public readonly committee: VCommittee;

    public readonly blockSendStep: Schedule;
    public readonly blockReceivedStep: Schedule;
    public readonly blockFinalizedStep: Schedule;

    private constructor(index: Uint64, committee: VCommittee) {
        this.index = index;
        this.committee = committee;


        this.blockSendStep = new Schedule(async()=>{this.onBlockSend(true)}, 5_000);
        this.blockReceivedStep = new Schedule(async()=>{this.onBlockReceived(true)}, 10_000);
        this.blockFinalizedStep = new Schedule(async()=>{this.onBlockFinalized(true)}, 15_000);
    }

    public static async create(index: Uint64) {
        const committee = await VCommittee.create(index);
        return new Slot(index, committee);
    }

    private async onBlockSend(timeout: boolean) {
        this.blockSendStep.cancel();
        if (timeout) {
            return;
        }
    }

    private async onBlockReceived(timeout: boolean) {
        this.blockReceivedStep.cancel();       
        if (timeout) {
            return;
        }
    }

    private async onBlockFinalized(timeout: boolean) {
        this.blockFinalizedStep.cancel();
        if (timeout) {
            return;
        }
    }

}

export default Slot;
