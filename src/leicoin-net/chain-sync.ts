import { Uint64 } from "low-level";
import { Blockchain } from "../storage/blockchain.js";
import { Queue } from "../utils/linkedlist";
import Block from "../objects/block.js";
import { type ForkChainstateData } from "../storage/chainstate.js";
import { type ChainstateMsg, GetChainstateMsg } from "./messaging/messages/chainstate.js";
import { type PeerSocket } from "./socket.js";
import LeiCoinNetNode from "./index.js";
import { BlocksMsg, GetBlocksMsg } from "./messaging/messages/block.js";
import Slot from "../pos/slot.js";
import cli from "../cli/cli.js";
import Utils from "../utils/index.js";

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

    static async doStartupSync(ignoreNoPeers = false) {
        
        cli.leicoin_net.info("Syncing the Blockchain...");

        // wait so the node can establish connections
        // maybe change this code later
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            cli.leicoin_net.info("Checking local chainstate and puling latest blocks...");
            const result = await this.syncChain();
            this.state = "synchronized";
            cli.leicoin_net.success("Successfully synced the Blockchain. Blocks processed: " + result.blocksSuccessfullyProcessedCount);
        } catch (err: any) {
            if (ignoreNoPeers) {
                this.state = "synchronized";
            } else {
                cli.leicoin_net.error(`Failed to sync the Blockchain: ${err.message}`);
                Utils.gracefulShutdown(1);
            }
        }

    }

    static async syncChain() {

        const latestBlock = Blockchain.chainstate.getLatestBlock("main") || { index: Uint64.from(0), slotIndex: Uint64.from(0) };

        /** @todo Do sync with multiple peers and check if no one is online*/

        const syncPeers = LeiCoinNetNode.connections.values().all();

        if (syncPeers.length === 0) {
            throw new Error("No peers to sync with");
        }

        const blocks = await this.getRemoteBlocks(latestBlock.index, syncPeers[0]);

        let blocksSuccessfullyProcessedCount = 0;

        for (const block of blocks) {
            const result = await Slot.processPastSlot(block.slotIndex, block);
            if (result) blocksSuccessfullyProcessedCount++;
        }

        for (const block of this.blockQueue) {
            const result = await Slot.processPastSlot(block.slotIndex, block);
            if (result) blocksSuccessfullyProcessedCount++;
            this.blockQueue.dequeue();
        }

        return { blocksSuccessfullyProcessedCount };
    }


}

