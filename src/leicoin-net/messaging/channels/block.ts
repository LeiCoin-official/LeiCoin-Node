import Verification from "../../../verification/index.js"
import Block from "../../../objects/block.js";
import { Uint256, type Uint } from "../../../binary/uint.js";
import POS from "../../../pos/index.js";
import { type Slot } from "../../../pos/slot.js";
import { MessagingChannel } from "../abstractChannel.js";
import cli from "../../../cli/cli.js";
import { VCodes } from "../../../verification/codes.js";
import { LNMsgType } from "../messageTypes.js";

export class NewBlockMC extends MessagingChannel {
    readonly id = LNMsgType.NEW_BLOCK;

    async receive(type: LNMsgType, data: Uint) {
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

export class GetBlocksMC extends MessagingChannel {
    readonly id = LNMsgType.GET_BLOCKS;

    async receive(type: LNMsgType, data: Uint, socketID: Uint256) {
        
        

    }
    
}