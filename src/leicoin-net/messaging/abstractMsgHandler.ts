import { type PeerSocket } from "../socket.js";
import { type LNAbstractMsgBody } from "./abstractMsg.js";


export enum LNMsgHandlerTypes {
    DEFAULT,
    REQUEST,
    RESPONSE,
    BROADCAST
}

/**
 * The Response Message which is returned to the socket it was received from
 * 
 * When null is returned, no response will be sent
 */
export type LNMsgHandlerResponse = Promise<LNAbstractMsgBody | null>;

export abstract class LNBasicMsgHandler {
    abstract readonly type: keyof typeof LNMsgHandlerTypes;
}

export abstract class LNMsgDefaultHandler {
    readonly type = "DEFAULT";
    abstract receive(data: LNAbstractMsgBody, socket: PeerSocket): LNMsgHandlerResponse;
}

export abstract class LNMsgRequestHandler extends LNBasicMsgHandler {
    readonly type = "REQUEST";
    abstract receive(data: LNAbstractMsgBody, socket: PeerSocket): LNMsgHandlerResponse;
}

export abstract class LNMsgResponseHandler {
    readonly type = "RESPONSE";
}

export abstract class LNBroadcastingMsgHandler extends LNBasicMsgHandler {
    readonly type = "BROADCAST";
    abstract receive(data: LNAbstractMsgBody): LNMsgHandlerResponse;
}


export type LNMsgHandlerConstructable<T extends LNBasicMsgHandler = LNBasicMsgHandler> = new() => T;

