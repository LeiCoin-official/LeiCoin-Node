import { Uint64 } from "../utils/binary.js";
import VCommittee from "./committee.js";

export class Slot {

    public readonly index: Uint64;
    public readonly committee: VCommittee;

    private constructor(index: Uint64, committee: VCommittee) {
        this.index = index;
        this.committee = committee;
    }

    public static async create(index: Uint64) {
        const committee = await VCommittee.create(index);
        return new Slot(index, committee);
    }

}

export default Slot;
