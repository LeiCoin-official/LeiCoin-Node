import { LeiCoinNetDataPackage } from "../packages.js";
import { CB } from "../../utils/callbacks.js";
import { NewBlockChannel } from "./channels/block.js";
import { NewTransactionChannel } from "./channels/transaction.js";
import { MessagingChannel, MessagingChannelConstructable } from "./abstractChannel.js";
import { Uint256 } from "../../binary/uint.js";

export class MessageRouter {

    private static channels: { [id: string]: MessagingChannel } = {};

    static registerChannels() {
        this.registerChannel(NewBlockChannel);
        this.registerChannel(NewTransactionChannel);
    }

    private static registerChannel(CLS: MessagingChannelConstructable) {
        const channel = new CLS();
        this.channels[channel.id.toHex()] = channel;
    }

    static async receiveData(rawData: Buffer, socketID: Uint256) {

        const data = LeiCoinNetDataPackage.extract(rawData);

        const channel: MessagingChannel | undefined = this.channels[data.type.toHex()];

        if (!channel) {
            return { cb: CB.NONE, message: `Unknown Data Type: ${data.type}` };
        }

        await channel.receive(data.type, data.content, socketID);

    }

}

export default MessageRouter;
