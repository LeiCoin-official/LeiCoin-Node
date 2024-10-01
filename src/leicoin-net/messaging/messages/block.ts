import Verification from "../../../verification/index.js"
import Block from "../../../objects/block.js";
import { type Uint } from "../../../binary/uint.js";
import POS from "../../../pos/index.js";
import { LNBroadcastingMsgHandler, LNMsgHandler } from "../abstractChannel.js";
import cli from "../../../cli/cli.js";
import { VCodes } from "../../../verification/codes.js";
import { LNMsgContent, LNMsgType } from "../messageTypes.js";
import { type LNSocket } from "../../socket.js";

export class NewBlockMsg extends LNMsgContent {
    
}

export namespace NewBlockMsg {
    export const TYPE = LNMsgType.from("2096"); // NEW_BLOCK
    
    export const Handler = new class Handler extends LNBroadcastingMsgHandler {
        readonly id = TYPE;

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
}

export class GetBlocksMsg extends LNMsgContent {

}

export namespace GetBlocksMsg {
    export const TYPE = LNMsgType.from("d372"); // GET_BLOCKS1

    export const Handler = new class Handler extends LNMsgHandler {
        readonly id = TYPE;

        async receive(data: Uint, socket: LNSocket) {

        }

        async send(data: Uint, socket: LNSocket) {

        }
    }
}