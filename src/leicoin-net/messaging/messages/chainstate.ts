import { type PeerSocket } from "../../socket.js";
import { LNMsgHandler } from "../abstractMsgHandler.js";
import { LNAbstractMsgBody, LNMsgType } from "../abstractMsg.js";

export class GetChainstateMsg extends LNAbstractMsgBody {
    
}

export namespace GetChainstateMsg {
    export const TYPE = LNMsgType.from("1f76"); // GET_CHAINSTATE
    
    export const Handler: LNMsgHandler = new class Handler extends LNMsgHandler {
        readonly acceptedMgs = "REQUEST";

        async receive(data: GetChainstateMsg, socket: PeerSocket) {
            return null;
        }
    }
}
