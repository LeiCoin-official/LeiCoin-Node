import { Uint, Uint256 } from "../../../binary/uint.js";
import { LNSocket } from "../../socket.js";
import { MessagingChannel } from "../abstractChannel.js";
import { LNMsgType } from "../messageTypes.js";

export class ChallengeMsg {
    constructor(readonly challenge: Uint256) {}

    public encodeToHex() {
        return this.challenge;
    }

    public static fromDecodedHex(hexData: Uint) {
        return new ChallengeMsg(
            new Uint256(hexData.slice(0, 32))
        );
    }
}

export class ChallengeMC extends MessagingChannel {
    readonly id = LNMsgType.CHALLENGE;

    async receive(data: Uint, socket: LNSocket) {

        if (socket.activeRequests.has) {
            
        }

    }

    async send(data: Uint, socket: LNSocket) {}
}
