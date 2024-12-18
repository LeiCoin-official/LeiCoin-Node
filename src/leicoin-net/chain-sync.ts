import { Uint64 } from "low-level";
import { Blockchain } from "../storage/blockchain.js";
import { Queue } from "../utils/linkedlist";
import Block from "../objects/block.js";
import { type ForkChainstateData } from "../storage/chainstate.js";
import { type ChainstateMsg, GetChainstateMsg } from "./messaging/messages/chainstate.js";
import { type PeerSocket } from "./socket.js";
import LeiCoinNetNode from "./index.js";
import { BlocksMsg, GetBlocksMsg } from "./messaging/messages/block.js";

export class NetworkSyncManager {

    static state: "synchronizing" | "synchronized" = "synchronizing";

    static readonly blockQueue = new Queue<Block>();

    private static async getRemoteChainstate(socket: PeerSocket) {
        const result = await socket.request<ChainstateMsg>(new GetChainstateMsg());
        if (result.status !== 0 || !result.data) {
            return null;
        }
        return result.data.chainstate;
    }

    private static async getRemoteChainstates() {
        const chainstates: Promise<ForkChainstateData | null>[] = [];

        for (const connection of LeiCoinNetNode.connections.values()) {
            chainstates.push(this.getRemoteChainstate(connection));
        }

        return (await Promise.all(chainstates)).filter(cs => cs) as ForkChainstateData[];
    }

    private static async getRemoteBlocks(sinceIndex: Uint64, socket: PeerSocket) {

        const blocks: Block[] = [];

        const currentBlockIndex = sinceIndex;

        while (true) {
            const response = await socket.request<BlocksMsg>(new GetBlocksMsg(currentBlockIndex, Uint64.from(512)));
            if (response.status !== 0 || !response.data) break;

            blocks.push(...response.data.blocks);

            if (response.data.blocks.length < 512) break;

            currentBlockIndex.add(512);
        }

        return blocks;
    }

    static async checkRemoteChainstates() {
        const latestLocalBlockIndex = Blockchain.chainstate.getLatestBlock("main")?.index || Uint64.from(0);
        const remoteChainstatesPromise = this.getRemoteChainstates();
    }

    static async doStartupSync() {

        const latestBlock = Blockchain.chainstate.getLatestBlock("main") || { index: Uint64.from(0), slotIndex: Uint64.from(0) };

        /** @todo Do sync with multiple peers and check if no one is online*/

        const syncPeers = LeiCoinNetNode.connections.values().all();

        if (syncPeers.length === 0) {
            throw new Error("No peers to sync with");
        }

        const blocks = await this.getRemoteBlocks(latestBlock.index, syncPeers[0]);
        
        const latestSyncedSlotIndex = latestBlock.slotIndex;

        for (const block of blocks) {
            
            if (block.slotIndex < latestSyncedSlotIndex) {
                continue;
            }

        }

        for (const block of this.blockQueue) {

            

            this.blockQueue.dequeue();
        }

    }

    static async syncChain() {
        
    }


}

