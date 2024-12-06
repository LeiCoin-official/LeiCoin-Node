import { type PeerSocket } from "../../socket.js";
import { LNMsgRequestHandler, LNMsgResponseHandler } from "../abstractMsgHandler.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";
import { ForkChainstateData } from "../../../storage/chainstate.js";
import { Dict } from "../../../utils/dataUtils.js";
import { BE, DataEncoder } from "../../../encoding/binaryEncoders.js";
import { Blockchain } from "../../../storage/blockchain.js";

export class GetChainstateMsg extends LNAbstractMsgBody {}

export namespace GetChainstateMsg {
    export const Name = "GET_CHAINSTATE";
    export const ID = LNMsgID.from("1f76");
    
    export const Handler = new class Handler extends LNMsgRequestHandler {
        async receive(data: GetChainstateMsg, socket: PeerSocket) {
            const cs = Blockchain.chainstate.getChainState("main");
            if (cs) {
                return new ChainstateMsg(cs);
            }
            return null;
        }
    }
}

// @ts-ignore
export class ChainstateMsg extends LNAbstractMsgBody {
    constructor(readonly chainstate: ForkChainstateData) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new ChainstateMsg(obj.chainstate);
    }

    protected static encodingSettings: readonly DataEncoder[] = [
        BE.Object("chainstate", ForkChainstateData)
    ]
}

export namespace ChainstateMsg {
    export const Name = "CHAINSTATE";
    export const ID = LNMsgID.from("1f77");
    export const Handler = new class Handler extends LNMsgResponseHandler {}
}
