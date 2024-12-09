import { type LNMsgInfo, LNMsgID } from "./abstractMsg.js";
import { type Dict } from "../../utils/dataUtils.js";
import { StatusMsg } from "./messages/status.js";
import { ChallengeMsg, ChallengeREQMsg, ChallengeResponseMsg } from "./messages/challenge.js";
import { GetBlocksMsg, NewBlockMsg } from "./messages/block.js";
import { GetTransactionsMsg, NewTransactionMsg } from "./messages/transaction.js";
import { GetChainstateMsg } from "./messages/chainstate.js";
import { OneTimeRequestMsg } from "./messages/oneTimeRequest.js";

class LNMsgUtils {
    static createLNMsgRegistry<T extends Dict<LNMsgInfo, string>>(registry: T) {
        return registry as Readonly<T>;
    }
}

export const LNMsgRegistry = LNMsgUtils.createLNMsgRegistry({
    STATUS: StatusMsg,

    CHALLENGE: ChallengeMsg,
    CHALLENGE_REQ: ChallengeREQMsg,
    CHALLENGE_RESPONSE: ChallengeResponseMsg,

    // ONE_TIME_REQUEST: OneTimeRequestMsg,

    NEW_BLOCK: NewBlockMsg,
    GET_BLOCKS: GetBlocksMsg,

    NEW_TRANSACTION: NewTransactionMsg,
    GET_TRANSACTIONS: GetTransactionsMsg,

    GET_CHAINSTATE: GetChainstateMsg,
});

/** @tode Find a new Name for MessageRouter that is more accurate */
export class MessageRouter {

    static getMsgInfo(id: LNMsgID): LNMsgInfo | undefined {
        return Object.values(LNMsgRegistry).find((msg) => msg.ID.eq(id));
    }

}

