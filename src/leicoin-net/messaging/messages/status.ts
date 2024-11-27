import { Uint16, Uint32 } from "low-level";
import { BE, type DataEncoder } from "../../../encoding/binaryEncoders.js";
import { Port } from "../../../objects/netinfo.js";
import { type Dict } from "../../../utils/dataUtils.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";
import { LNMsgDefaultHandler } from "../abstractMsgHandler.js";
import { type PeerSocket } from "../../socket.js";

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
    export const ID = LNMsgID.from("1761"); // STATUS

    export const Handler = new class Handler extends LNMsgDefaultHandler {
        async receive(data: StatusMsg, socket: PeerSocket) {
            
            const response = socket.activeRequests.get(Uint32.from(0));

            if (!response) {
                return null;
            }

            response.resolve(data);

            return null;
        }
    }
}
