import Block from "./block.js";

interface SlotProposedBlock {
    status: "proposed";
    data: Block;
}

interface SlotEmptyBlock {
    status: "empty";
    data: null;
}

export class Slot {

    index: string;
    block: SlotProposedBlock | SlotEmptyBlock;
    slashings: string[];

    constructor(index: string, block: SlotProposedBlock | SlotEmptyBlock, slashings: string[]) {
        this.index = index;
        this.block = block;
        this.slashings = slashings;
    }

}

export default Slot;
