import { Uint, Uint16 } from "low-level";
import { BE, type DataEncoder } from "../../../encoding/binaryEncoders.js";
import { Port } from "../../../objects/netinfo.js";
import { type Dict } from "../../../utils/dataUtils.js";
import { type PeerSocket } from "../../socket.js";
import { LNMsgHandler } from "../abstractChannel.js";
import { LNAbstractMsgBody, LNMsgType } from "../messageTypes.js";

export class StatusMsg extends LNAbstractMsgBody {

    constructor(
        readonly version: Uint16,
        readonly port: Port
    ) {super()}
    
    protected static fromDict(obj: Dict<any>) {
        return new StatusMsg(
            obj.version,
            obj.port
        )
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE(Uint16, "version"),
        BE(Port, "port")
    ]

}

export namespace StatusMsg {
    export const TYPE = LNMsgType.from("1761"); // STATUS

    export const Handler = new class Handler extends LNMsgHandler {
        readonly acceptedMgs = "REQUEST";

        async receive(data: StatusMsg, socket: PeerSocket) {

            if (!data) {
                return null;
            }
    
            if (socket.uuid.eq(0)) {
                
            }
            
            return null;

        }

    }
}
