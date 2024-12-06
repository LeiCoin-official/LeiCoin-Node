import { type PeerSocket } from "../../socket.js";
import { LNMsgRequestHandler } from "../abstractMsgHandler.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";

export class GetChainstateMsg extends LNAbstractMsgBody {
    
}

export namespace GetChainstateMsg {
    export const Name = "GET_CHAINSTATE";
    export const ID = LNMsgID.from("1f76");
    
    export const Handler = new class Handler extends LNMsgRequestHandler {
        async receive(data: GetChainstateMsg, socket: PeerSocket) {
            return null;
        }
    }
}


export class ChainstateMsg extends LNAbstractMsgBody {
    
}

export namespace ChainstateMsg {
    export const Name = "CHAINSTATE";
    export const ID = LNMsgID.from("1f77");
    
    export const Handler = new class Handler extends LNMsgRequestHandler {
        async receive(data: ChainstateMsg, socket: PeerSocket) {
            return null;
        }
    }
}
