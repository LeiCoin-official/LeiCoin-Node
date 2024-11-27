import { type PeerSocket } from "../../socket.js";
import { LNMsgRequestHandler } from "../abstractMsgHandler.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";

export class GetChainstateMsg extends LNAbstractMsgBody {
    
}

export namespace GetChainstateMsg {
    export const ID = LNMsgID.from("1f76"); // GET_CHAINSTATE
    
    export const Handler = new class Handler extends LNMsgRequestHandler {
        async receive(data: GetChainstateMsg, socket: PeerSocket) {
            return null;
        }
    }
}
