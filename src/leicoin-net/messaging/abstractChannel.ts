import { Uint256, type Uint } from "../../binary/uint.js";
import LeiCoinNetNode from "../index.js";
import { type LNMsgType } from "./messageTypes.js";
import { LeiCoinNetDataPackage } from "../packages.js";
import { type LNSocket } from "../socket.js";

export type MessagingChannelConstructable<T extends MessagingChannel = MessagingChannel> = new() => T;

abstract class BasicMessagingChannel {
    abstract readonly id: LNMsgType;
    abstract receive(data: Uint, socket: LNSocket): Promise<void>;
}

export abstract class MessagingChannel extends BasicMessagingChannel {
    abstract send(data: Uint | null, socket: LNSocket): Promise<void>;
}

export abstract class BroadcastingChannel extends BasicMessagingChannel {
    abstract receive(data: Uint): Promise<void>;
    async broadcast(data: Uint) {
        await LeiCoinNetNode.broadcast(LeiCoinNetDataPackage.create(this.id, data));
    }
}