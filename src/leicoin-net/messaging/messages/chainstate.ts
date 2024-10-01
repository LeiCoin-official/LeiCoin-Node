import { Uint } from "../../../binary/uint.js";
import { LNMsgHandler } from "../abstractChannel.js";
import { LNMsgContent, LNMsgType } from "../messageTypes.js";

export class GetChainstateMsg extends LNMsgContent {
    
}

export namespace GetChainstateMsg {
    export const TYPE = LNMsgType.from("1f76"); // GET_CHAINSTATE
    
    export const Handler = new class Handler extends LNMsgHandler {
        readonly id = TYPE;
        
        async receive(data: Uint) {
            
        }
        
        async send(data: Uint) {

        }
    }
}
