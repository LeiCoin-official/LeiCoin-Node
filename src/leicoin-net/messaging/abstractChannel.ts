import { type PeerSocket } from "../socket.js";
import { type LNAbstractMsgBody } from "./messageTypes.js";

export type LNMsgHandlerConstructable<T extends LNBasicMsgHandler = LNBasicMsgHandler> = new() => T;

export type LNMsgHandlerResponse = Promise<LNAbstractMsgBody | null>;

export abstract class LNBasicMsgHandler {
    abstract readonly acceptedMgs: "DEFAULT" | "REQUEST" | "BROADCAST";
    abstract receive(data: LNAbstractMsgBody, socket: PeerSocket): LNMsgHandlerResponse;
}

export abstract class LNMsgHandler extends LNBasicMsgHandler {
    abstract readonly acceptedMgs: "DEFAULT" | "REQUEST";
}

export abstract class LNBroadcastingMsgHandler extends LNBasicMsgHandler {
    readonly acceptedMgs = "BROADCAST";
    abstract receive(data: LNAbstractMsgBody): LNMsgHandlerResponse;
}
