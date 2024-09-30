import { LeiCoinNetDataPackage } from "../packages.js";
import { CB } from "../../utils/callbacks.js";
import { NewBlockMC } from "./messages/block.js";
import { NewTransactionChannel } from "./messages/transaction.js";
import { BasicMessagingChannel, type MessagingChannel, type MessagingChannelConstructable } from "./abstractChannel.js";
import { Uint } from "../../binary/uint.js";
import { type LNRequest, type LNSocket } from "../socket.js";
import { AbstractBinaryMap, UintMap } from "../../binary/map.js";
import { LNMsgType } from "./messageTypes.js";
import { StatusMsg } from "./messages/status.js";

class MessagingChannelMap<V extends BasicMessagingChannel = BasicMessagingChannel> extends AbstractBinaryMap<LNMsgType, V> {
    constructor(entries?: readonly (readonly [LNMsgType, V])[]) {
        super(LNMsgType, entries);
    }
}

export namespace LNMsgRegistry {
    SATUS: StatusMsg
}

export class MessageRouter {

    private static channels: MessagingChannelMap = new MessagingChannelMap();
    static globalRequests: UintMap<LNRequest> = new UintMap();

    static registerChannels() {
        this.registerChannel(NewBlockMC);
        this.registerChannel(NewTransactionChannel);
    }

    private static registerChannel(CLS: MessagingChannelConstructable) {
        const channel = new CLS();
        this.channels.set(channel.id, channel);
    }

    static getChannel(id: LNMsgType) {
        return this.channels.get(id);
    }

    static async receiveData(rawData: Uint | Buffer, socket: LNSocket) {

        const data = LeiCoinNetDataPackage.extract(rawData);

        const channel: BasicMessagingChannel | undefined = this.channels[data.type.toHex()];

        if (!channel) {
            return { cb: CB.NONE, message: `Unknown Data Type: ${data.type}` };
        }

        

        await channel.receive(data.content, socket);

    }

}

export default MessageRouter;
