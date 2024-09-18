import { type Uint } from "../../binary/uint.js";
import LeiCoinNetNode from "../index.js";
import { type LNMsgType } from "./messageTypes.js";
import { LeiCoinNetDataPackage } from "../packages.js";

export type MessagingChannelConstructable<T extends MessagingChannel = MessagingChannel> = new() => T;

export abstract class MessagingChannel {

    abstract readonly id: LNMsgType;

    abstract receive(type: LNMsgType, data: Uint): Promise<void>;
    
    async broadcast(type: LNMsgType, data: Uint, ...args: any[]) {
        await LeiCoinNetNode.broadcast(LeiCoinNetDataPackage.create(type, data));
    }
}
