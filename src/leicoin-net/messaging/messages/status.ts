import { Uint, Uint16 } from "../../../binary/uint.js";
import { BE, DataEncoder } from "../../../encoding/binaryEncoders.js";
import { Port } from "../../../objects/netinfo.js";
import { Dict } from "../../../utils/dataUtils.js";
import LeiCoinNetNode from "../../index.js";
import { type LNSocket } from "../../socket.js";
import { MessagingChannel } from "../abstractChannel.js";
import { LNMsgData, LNMsgType } from "../messageTypes.js";

export class StatusMsg extends LNMsgData {

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
    export const TYPE = LNMsgType.STATUS;
    export const Handler = new class Handler extends MessagingChannel {
        readonly id = LNMsgType.STATUS;

        async receive(data: Uint, socket: LNSocket) {
            
            const status = StatusMsg.fromDecodedHex(data);
    
            if (!status) {
                return;
            }
    
            if (socket.meta.id.eq(0)) {
                
            }
    
        }
    
        async send(data: null, socket: LNSocket) {
    
            socket.send(
                new StatusMsg(
                    Uint16.from(0),
                    Port.from(LeiCoinNetNode.getServerInfo().port)
                ).encodeToHex()
            )
    
        }
    }
}
