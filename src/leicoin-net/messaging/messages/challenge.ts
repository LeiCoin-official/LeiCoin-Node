import { Uint, Uint256, Uint32 } from "low-level";
import { BE, DataEncoder } from "../../../encoding/binaryEncoders.js";
import { type LNSocket } from "../../socket.js";
import { LNMsgHandler } from "../abstractChannel.js";
import { LNMsgContent, LNMsgType } from "../messageTypes.js";

export class ChallengeMsg extends LNMsgContent {

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
    export const TYPE = LNMsgType.from("77a9"); // CHALLENGE

    export const Handler = new class Handler extends LNMsgHandler {
        readonly acceptedMgs = "REQUEST";

        async receive(data: ChallengeMsg, socket: LNSocket) {
            return null;
        }
    }
}
