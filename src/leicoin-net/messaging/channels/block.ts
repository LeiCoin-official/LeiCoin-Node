import Verification from "../../../verification/index.js"
import Block from "../../../objects/block.js";
import { type Uint } from "../../../binary/uint.js";
import POS from "../../../pos/index.js";
import { type Slot } from "../../../pos/slot.js";
import { BroadcastingChannel, MessagingChannel } from "../abstractChannel.js";
import cli from "../../../cli/cli.js";
import { VCodes } from "../../../verification/codes.js";
import { LNMsgType } from "../messageTypes.js";
import { type LNSocket } from "../../socket.js";

export class NewBlockMC extends BroadcastingChannel {
    readonly id = LNMsgType.NEW_BLOCK;

    async receive(data: Uint) {
        const block = Block.fromDecodedHex(data) as Block;

        const verification_result = await Verification.verifyMintedBlock(block);

        if (verification_result !== 12000) {
            cli.data.info(`Block rejected. Code: ${verification_result}, Message: ${VCodes[verification_result]}`);
            return;
        }

        this.broadcast(data);
        (await POS.getSlot(block.slotIndex)).processBlock(block);

    }
    
}

export class GetBlocksMC extends MessagingChannel {

    readonly id = LNMsgType.GET_BLOCKS;

    async receive(data: Uint, socketID: LNSocket) {
        
        

    }

    async send(data: Uint, socket: LNSocket) {
        
    }
    
}

