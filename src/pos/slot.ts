import { Uint64 } from "../utils/binary.js";
import VCommittee from "./committee.js";

export class Slot {

    public readonly index: Uint64;
    public readonly committee: VCommittee;

    private blockSendStep: NodeJS.Timeout;
    private blockReceivedStep: NodeJS.Timeout;
    private blockFinalizedStep: NodeJS.Timeout;

    private constructor(index: Uint64, committee: VCommittee) {
        this.index = index;
        this.committee = committee;
        this.blockSendStep = setTimeout(() => {this.onBlockSend(true)}, 5_000);
        this.blockReceivedStep = setTimeout(() => {this.onBlockReceived(true)}, 10_000);
        this.blockFinalizedStep = setTimeout(() => {this.onBlockFinalized(true)}, 15_000);
    }

    public static async create(index: Uint64) {
        const committee = await VCommittee.create(index);
        return new Slot(index, committee);
    }

    private async onBlockSend(timeout = false) {
        clearTimeout(this.blockSendStep);
    }

    private async onBlockReceived(timeout = false) {
        clearTimeout(this.blockReceivedStep);
    }

    private async onBlockFinalized(timeout = false) {
        clearTimeout(this.blockFinalizedStep);
    }

}

export default Slot;
