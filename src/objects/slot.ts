import { Uint64 } from "../utils/binary.js";
import Block from "./block.js";
import Slashing from "./slashing.js";

interface SlotProposedBlock {
    status: "proposed";
    data: Block;
}

interface SlotEmptyBlock {
    status: "empty";
    data: null;
}

export class Slot {

    index: Uint64;
    block: SlotProposedBlock | SlotEmptyBlock;
    slashings: Slashing[];

    constructor(index: Uint64, block: SlotProposedBlock | SlotEmptyBlock, slashings: Slashing[]) {
        this.index = index;
        this.block = block;
        this.slashings = slashings;
    }

}

export default Slot;
