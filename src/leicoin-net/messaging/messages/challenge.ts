import { Uint, Uint256, Uint32 } from "../../../binary/uint.js";
import { BE, DataEncoder } from "../../../encoding/binaryEncoders.js";
import { LNSocket } from "../../socket.js";
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
        readonly id = TYPE;

        async receive(data: Uint, socket: LNSocket) {

            const requestID = new Uint32(data.slice(0, 4));
            //if ()

        }

        async receiveRequest(data: Uint, socket: LNSocket) {
            
        }

        async send(data: Uint, socket: LNSocket) {

            //if ()

        }
    }
}
