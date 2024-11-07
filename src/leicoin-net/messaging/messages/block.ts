import Verification from "../../../verification/index.js"
import Block from "../../../objects/block.js";
import POS from "../../../pos/index.js";
import { LNBroadcastingMsgHandler, LNMsgHandler } from "../abstractChannel.js";
import cli from "../../../cli/cli.js";
import { VCodes } from "../../../verification/codes.js";
import { LNAbstractMsgBody, LNMsgType } from "../messageTypes.js";
import { type LNSocket } from "../../socket.js";
import { BE, type DataEncoder } from "../../../encoding/binaryEncoders.js";

export class NewBlockMsg extends LNAbstractMsgBody {

    constructor(readonly block: Block) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new NewBlockMsg(obj.block);
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE.Object("block", Block)
    ]
}

export namespace NewBlockMsg {
    export const TYPE = LNMsgType.from("2096"); // NEW_BLOCK
    
    export const Handler = new class Handler extends LNBroadcastingMsgHandler {
        async receive(data: NewBlockMsg) {
            const verification_result = await Verification.verifyMintedBlock(data.block);
    
            if (verification_result !== 12000) {
                cli.data.info(`Block rejected. Code: ${verification_result}, Message: ${VCodes[verification_result]}`);
                return null;
            }

            this.handleBlock(data.block);
            return data;
        }

        private async handleBlock(block: Block) {
            (await POS.getSlot(block.slotIndex)).processBlock(block);
        }
    } as LNBroadcastingMsgHandler;
}


export class GetBlocksMsg extends LNAbstractMsgBody {

}

export namespace GetBlocksMsg {
    export const TYPE = LNMsgType.from("d372"); // GET_BLOCKS

    export const Handler = new class Handler extends LNMsgHandler {
        readonly acceptedMgs = "REQUEST";
        
        async receive(data: GetBlocksMsg, socket: LNSocket) {
            return null;
        }
    }
}