import Verification from "../../verification/index.js"
import Block from "../../objects/block.js";
import { type LNPPX } from "../packages.js";
import { type Uint } from "../../binary/uint.js";
import POS from "../../pos/index.js";
import { type Slot } from "../../pos/slot.js";
import { Pipeline } from "./abstractPipeline.js";
import cli from "../../cli/cli.js";
import { VCodes } from "../../verification/codes.js";

export default class BlockPipeline extends Pipeline {
    readonly id = "2096";

    async receive(type: LNPPX, data: Uint) {
        const block = Block.fromDecodedHex(data) as Block;

        const verification_result = await Verification.verifyMintedBlock(block);

        if (verification_result !== 12000) {
            cli.data.info(`Block rejected. Code: ${verification_result}, Message: ${VCodes[verification_result]}`);
            return;
        }

        this.broadcast(type, data);
        (await POS.getSlot(block.slotIndex) as Slot).processBlock(block);

    }
    
}