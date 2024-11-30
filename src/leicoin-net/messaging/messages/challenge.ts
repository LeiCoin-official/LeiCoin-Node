import { Uint256, Uint32 } from "low-level";
import { BE, DataEncoder } from "../../../encoding/binaryEncoders.js";
import { type PeerSocket } from "../../socket.js";
import { LNMsgDefaultHandler, LNMsgRequestHandler } from "../abstractMsgHandler.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";

export class ChallengeMsg extends LNAbstractMsgBody {

    constructor(
        readonly id: Uint32,
        readonly challenge: Uint256
    ) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new ChallengeMsg(
            obj.id,
            obj.challenge
        )
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE(Uint32, "id"),
        BE(Uint256, "challenge")
    ]
}

export namespace ChallengeMsg {
    export const ID = LNMsgID.from("77a9"); // CHALLENGE

    export const Handler = new class Handler extends LNMsgRequestHandler {
        async receive(data: ChallengeMsg, socket: PeerSocket) {
            return null;
        }
    }
}

export class ChallengeREQMsg extends LNAbstractMsgBody {

    constructor(
        readonly id: Uint32
    ) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new ChallengeREQMsg(obj.id)
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE(Uint32, "id")
    ]
    
}

export namespace ChallengeREQMsg {
    export const ID = LNMsgID.from("77a9"); // CHALLENGE

    export const Handler = new class Handler extends LNMsgDefaultHandler {
        async receive(data: ChallengeMsg, socket: PeerSocket) {
            return null;
        }
    }
}
