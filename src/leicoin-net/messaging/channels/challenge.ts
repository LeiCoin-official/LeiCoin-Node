import { Uint } from "../../../binary/uint.js";
import { LNSocket } from "../../socket.js";
import { MessagingChannel } from "../abstractChannel.js";
import { LNMsgType } from "../messageTypes.js";

export class ChallengeMC extends MessagingChannel {

    readonly id = LNMsgType.CHALLENGE;

    async receive(data: Uint, socket: LNSocket) {
        
        

    }


    async send(data: Uint, socket: LNSocket) {
        
        

    }

}

