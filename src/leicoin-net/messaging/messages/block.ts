import Verification from "../../../verification/index.js"
import Block from "../../../objects/block.js";
import POS from "../../../pos/index.js";
import { LNBroadcastingMsgHandler, LNMsgRequestHandler, LNMsgResponseHandler } from "../abstractMsgHandler.js";
import cli from "../../../cli/cli.js";
import { VCodes } from "../../../verification/codes.js";
import { LNAbstractMsgBody, LNMsgID } from "../abstractMsg.js";
import { type PeerSocket } from "../../socket.js";
import { BE, type DataEncoder } from "../../../encoding/binaryEncoders.js";
import { NetworkSyncManager } from "../../chain-sync.js";
import { Uint64 } from "low-level";
import { ErrorResponseMsg } from "./error.js";
import { Blockchain } from "../../../storage/blockchain.js";
import { CB } from "../../../utils/callbacks.js";

export class NewBlockMsg extends LNAbstractMsgBody {

    constructor(readonly block: Block) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new NewBlockMsg(obj.block);
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE.Object("block", Block)
    ]
}

export namespace NewBlockMsg {
    export const Name = "NEW_BLOCK";
    export const ID = LNMsgID.from("2096");
    
    export const Handler = new class Handler extends LNBroadcastingMsgHandler {
        async receive(data: NewBlockMsg) {
            const verification_result = await Verification.verifyMintedBlock(data.block);
    
            if (verification_result !== 12000) {
                /** @todo CLI Debug Mode for log messages like this */
                //cli.data.info(`Block rejected. Code: ${verification_result}, Message: ${VCodes[verification_result]}`);
                return null;
            }

            this.handleBlock(data.block);
            return data;
        }

        private async handleBlock(block: Block) {
            if (NetworkSyncManager.state !== "synchronized") {
                NetworkSyncManager.blockQueue.enqueue(block);
                return;
            }
            (await POS.getSlot(block.slotIndex))?.processBlock(block);
        }
    } as LNBroadcastingMsgHandler;
}


export class GetBlocksMsg extends LNAbstractMsgBody {
    
    constructor(
        readonly startingIndex: Uint64,
        readonly count: Uint64,
    ) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new GetBlocksMsg(obj.startingIndex, obj.count);
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE(Uint64, "startingIndex"),
        BE(Uint64, "count")
    ]

}

export namespace GetBlocksMsg {
    export const Name = "GET_BLOCKS";
    export const ID = LNMsgID.from("d372");

    export const Handler = new class Handler extends LNMsgRequestHandler {
        async receive(data: GetBlocksMsg, socket: PeerSocket) {
            if (NetworkSyncManager.state !== "synchronized") {
                return ErrorResponseMsg.fromCode(1);
            }

            /** Maybe ajust this later */
            if (data.count.gt(512)) {
                return ErrorResponseMsg.fromCode(2);
            }

            const blocks: Block[] = [];

            let index = data.startingIndex;
            const maxIndex = index.add(data.count);
            
            while (index.lt(maxIndex)) {
                const block = Blockchain.blocks.get(index);
                if (block.cb !== CB.SUCCESS || !block.data) break;
                blocks.push(block.data);
                index = index.add(1);
            }

            return new BlocksMsg(blocks);
        }
    }
}


export class BlocksMsg extends LNAbstractMsgBody {

    constructor(readonly blocks: Block[]) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new BlocksMsg(obj.blocks);
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE.Array("blocks", 2, Block)
    ]

}

export namespace BlocksMsg {
    export const Name = "BLOCKS";
    export const ID = LNMsgID.from("8017");
    export const Handler = new class Handler extends LNMsgResponseHandler {}
}
