import Verification from "../../verification/index.js"
import Block from "../../objects/block.js";
import { type LNPPX } from "../packages.js";
import { type Uint } from "../../binary/uint.js";
import POS from "../../pos/index.js";
import { type Slot } from "../../pos/slot.js";
import { Pipeline } from "./abstractPipeline.js";

export default class BlockPipeline extends Pipeline {
    readonly id = "2096";

    async receive(type: LNPPX, data: Uint) {
        const block = Block.fromDecodedHex(data) as Block;

        if (await Verification.verifyMintedBlock(block) !== 12000) return;

        this.broadcast(type, data);
        (POS.getSlot(block.slotIndex) as Slot).processBlock(block);

    }
    
}