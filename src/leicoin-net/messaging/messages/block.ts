import Verification from "../../../verification/index.js"
import Block from "../../../objects/block.js";
import POS from "../../../pos/index.js";
import { LNBroadcastingMsgHandler, LNMsgRequestHandler } from "../abstractMsgHandler.js";
import cli from "../../../cli/cli.js";
import { VCodes } from "../../../verification/codes.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";
import { type PeerSocket } from "../../socket.js";
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
    export const Name = "NEW_BLOCK";
    export const ID = LNMsgID.from("2096");
    
    export const Handler = new class Handler extends LNBroadcastingMsgHandler {
        async receive(data: NewBlockMsg) {
            const verification_result = await Verification.verifyMintedBlock(data.block);
    
            if (verification_result !== 12000) {
                /** @todo CLI Debug Mode for log messages like this */
                //cli.data.info(`Block rejected. Code: ${verification_result}, Message: ${VCodes[verification_result]}`);
                return null;
            }

            this.handleBlock(data.block);
            return data;
        }

        private async handleBlock(block: Block) {
            (await POS.getSlot(block.slotIndex))?.processBlock(block);
        }
    } as LNBroadcastingMsgHandler;
}


export class GetBlocksMsg extends LNAbstractMsgBody {

}

export namespace GetBlocksMsg {
    export const Name = "GET_BLOCKS";
    export const ID = LNMsgID.from("d372");

    export const Handler = new class Handler extends LNMsgRequestHandler {
        async receive(data: GetBlocksMsg, socket: PeerSocket) {
            return null;
        }
    }
}