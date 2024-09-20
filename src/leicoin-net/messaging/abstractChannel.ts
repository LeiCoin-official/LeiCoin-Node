import { Uint256, type Uint } from "../../binary/uint.js";
import LeiCoinNetNode from "../index.js";
import { type LNMsgType } from "./messageTypes.js";
import { LeiCoinNetDataPackage } from "../packages.js";
import { type LNSocket } from "../socket.js";

export type MessagingChannelConstructable<T extends MessagingChannel = MessagingChannel> = new() => T;

export abstract class MessagingChannel {

    abstract readonly id: LNMsgType;

    abstract receive(data: Uint, socket: LNSocket): Promise<void>;
    
    async broadcast(data: Uint, ...args: any[]) {
        await LeiCoinNetNode.broadcast(LeiCoinNetDataPackage.create(this.id, data));
    }

    async send?(socket: LNSocket, data?: Uint): Promise<void> {
        
    }
}
