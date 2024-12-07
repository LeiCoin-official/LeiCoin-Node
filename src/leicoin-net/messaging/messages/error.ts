import { Uint16 } from "low-level";
import { BE, type DataEncoder } from "../../../encoding/binaryEncoders.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";
import { LNMsgResponseHandler } from "../abstractMsgHandler.js";

export class ErrorResponseMsg extends LNAbstractMsgBody {

    constructor(
        readonly id: Uint16,
    ) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new ErrorResponseMsg(obj.id);
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE(Uint16, "id")
    ]

}

export namespace ErrorResponseMsg {
    export const ID = LNMsgID.from("fff0"); // ERROR_RESPONSE
    export const Handler = new class Handler extends LNMsgResponseHandler {}
}
