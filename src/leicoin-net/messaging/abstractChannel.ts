import { type LNSocket } from "../socket.js";
import { type LNMsgContent } from "./messageTypes.js";

export type LNMsgHandlerConstructable<T extends LNBasicMsgHandler = LNBasicMsgHandler> = new() => T;

export type LNMsgHandlerResponse = Promise<LNMsgContent | null>;

export abstract class LNBasicMsgHandler {
    abstract receive(data: LNMsgContent, socket: LNSocket): LNMsgHandlerResponse;
}

export abstract class LNMsgHandler extends LNBasicMsgHandler {}

export abstract class LNBroadcastingMsgHandler extends LNBasicMsgHandler {
    abstract receive(data: LNMsgContent): LNMsgHandlerResponse;
}
