import Block from "./block.js";

interface SlotProposedBlock {
    status: "proposed";
    data: Block;
}

interface SlotEmptyBlock {
    status: "empty";
    data: null;
}

interface SlotLike {
    index: string;
    block: SlotProposedBlock | SlotEmptyBlock;
    slashings: string[];
}

export class Slot implements SlotLike {

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
