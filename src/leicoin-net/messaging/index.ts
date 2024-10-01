import { LeiCoinNetDataPackage } from "../packages.js";
import { CB } from "../../utils/callbacks.js";
import { LNBasicMsgHandler, type LNMsgHandlerConstructable } from "./abstractChannel.js";
import { Uint } from "../../binary/uint.js";
import { type LNRequest, type LNSocket } from "../socket.js";
import { AbstractBinaryMap, UintMap } from "../../binary/map.js";
import { type LNMsgInfo, LNMsgType } from "./messageTypes.js";
import { type Dict } from "../../utils/dataUtils.js";
import { StatusMsg } from "./messages/status.js";
import { ChallengeMsg } from "./messages/challenge.js";
import { GetBlocksMsg, NewBlockMsg } from "./messages/block.js";
import { GetTransactionsMsg, NewTransactionMsg } from "./messages/transaction.js";
import { GetChainstateMsg } from "./messages/chainstate.js";

class LNMsgUtils {
    static createLNMsgRegistry<T extends Dict<LNMsgInfo, string>>(registry: T) {
        return registry as Readonly<T>;
    }
}

class MessagingChannelMap<V extends LNBasicMsgHandler = LNBasicMsgHandler> extends AbstractBinaryMap<LNMsgType, V> {
    constructor(entries?: readonly (readonly [LNMsgType, V])[]) {
        super(LNMsgType, entries);
    }
}

export const LNMsgRegistry = LNMsgUtils.createLNMsgRegistry({
    STATUS: StatusMsg,

    CHALLENGE: ChallengeMsg,

    NEW_BLOCK: NewBlockMsg,
    GET_BLOCKS: GetBlocksMsg,

    NEW_TRANSACTION: NewTransactionMsg,
    GET_TRANSACTIONS: GetTransactionsMsg,

    GET_CHAINSTATE: GetChainstateMsg,
});

export class MessageRouter {

    private static channels: MessagingChannelMap = new MessagingChannelMap();
    static globalRequests: UintMap<LNRequest> = new UintMap();

    static registerChannels() {
        // this.registerChannel(NewBlockMC);
        // this.registerChannel(NewTransactionChannel);
    }

    private static registerChannel(CLS: LNMsgHandlerConstructable) {
        const channel = new CLS();
        this.channels.set(channel.id, channel);
    }

    static getMsgInfo(id: LNMsgType) {
        return Object.values(LNMsgRegistry).find((msg) => msg.TYPE.eq(id));
    }

    static async receiveData(rawData: Uint | Buffer, socket: LNSocket) {

        const data = LeiCoinNetDataPackage.extract(rawData);

        const channel: LNBasicMsgHandler | undefined = this.channels[data.type.toHex()];

        if (!channel) {
            return { cb: CB.NONE, message: `Unknown Data Type: ${data.type}` };
        }

        

        await channel.receive(data.content, socket);

    }

}

export default MessageRouter;
