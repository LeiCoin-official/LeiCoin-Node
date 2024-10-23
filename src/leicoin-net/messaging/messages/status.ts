import { Uint, Uint16 } from "low-level/uint";
import { BE, type DataEncoder } from "../../../encoding/binaryEncoders.js";
import { Port } from "../../../objects/netinfo.js";
import { type Dict } from "../../../utils/dataUtils.js";
import { type LNSocket } from "../../socket.js";
import { LNMsgHandler } from "../abstractChannel.js";
import { LNMsgContent, LNMsgType } from "../messageTypes.js";

export class StatusMsg extends LNMsgContent {

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

        async receive(data: StatusMsg, socket: LNSocket) {

            if (!data) {
                return null;
            }
    
            if (socket.meta.id.eq(0)) {
                
            }
            
            return null;

        }

    }
}
