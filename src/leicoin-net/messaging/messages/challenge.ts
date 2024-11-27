import { Uint256 } from "low-level";
import { BE, DataEncoder } from "../../../encoding/binaryEncoders.js";
import { type PeerSocket } from "../../socket.js";
import { LNMsgRequestHandler } from "../abstractMsgHandler.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";

export class ChallengeMsg extends LNAbstractMsgBody {

    constructor(
        readonly challenge: Uint256
    ) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new ChallengeMsg(
            obj.challenge
        )
    }

    protected static readonly encodingSettings: DataEncoder[] = [
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
