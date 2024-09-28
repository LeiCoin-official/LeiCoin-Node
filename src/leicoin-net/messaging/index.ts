import { LeiCoinNetDataPackage } from "../packages.js";
import { CB } from "../../utils/callbacks.js";
import { NewBlockMC } from "./channels/block.js";
import { NewTransactionChannel } from "./channels/transaction.js";
import { BasicMessagingChannel, type MessagingChannel, type MessagingChannelConstructable } from "./abstractChannel.js";
import { Uint } from "../../binary/uint.js";
import { type LNRequest, type LNSocket } from "../socket.js";
import { UintMap } from "../../binary/map.js";

export class MessageRouter {

    private static channels: { [id: string]: BasicMessagingChannel } = {};
    static globalRequests: UintMap<LNRequest> = new UintMap();

    static registerChannels() {
        this.registerChannel(NewBlockMC);
        this.registerChannel(NewTransactionChannel);
    }

    private static registerChannel(CLS: MessagingChannelConstructable) {
        const channel = new CLS();
        this.channels[channel.id.toHex()] = channel;
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
