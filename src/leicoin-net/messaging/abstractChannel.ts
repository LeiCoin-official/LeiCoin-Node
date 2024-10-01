import { type Uint } from "../../binary/uint.js";
import LeiCoinNetNode from "../index.js";
import { type LNMsgType } from "./messageTypes.js";
import { LeiCoinNetDataPackage } from "../packages.js";
import { type LNSocket } from "../socket.js";

export type LNMsgHandlerConstructable<T extends LNBasicMsgHandler = LNBasicMsgHandler> = new() => T;

export abstract class LNBasicMsgHandler {
    abstract readonly id: LNMsgType;
    abstract receive(data: Uint, socket: LNSocket): Promise<void>;
}

export abstract class LNMsgHandler extends LNBasicMsgHandler {
    abstract send(data: Uint | null, socket: LNSocket): Promise<void>;
}

export abstract class LNBroadcastingMsgHandler extends LNBasicMsgHandler {
    abstract receive(data: Uint): Promise<void>;
    async broadcast(data: Uint) {
        await LeiCoinNetNode.broadcast(LeiCoinNetDataPackage.create(this.id, data));
    }
}
