import { LeiCoinNetDataPackage } from "../packages.js";
import { CB } from "../../utils/callbacks.js";
import NewBlockPipeline from "./channels/blocks.js";
import NewTransactionChannel from "./channels/transactions.js";
import { MessagingChannel, MessagingChannelConstructable } from "./abstractChannel.js";

export class MessageRouter {

    private static channels: { [id: string]: MessagingChannel } = {};

    static registerChannels() {
        this.registerChannel(NewBlockPipeline);
        this.registerChannel(NewTransactionChannel);
    }

    private static registerChannel(CLS: MessagingChannelConstructable) {
        const pipeline = new CLS();
        this.channels[pipeline.id.toHex()] = pipeline;
    }

    static async receiveData(rawData: Buffer) {

        const data = LeiCoinNetDataPackage.extract(rawData);

        const channel: MessagingChannel | undefined = this.channels[data.type.toHex()];

        if (!channel) {
            return { cb: CB.NONE, message: `Unknown Data Type: ${data.type}` };
        }

        await channel.receive(data.type, data.content);

    }

}

export default MessageRouter;
