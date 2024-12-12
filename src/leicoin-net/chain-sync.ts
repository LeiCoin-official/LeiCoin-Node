import { Uint64 } from "low-level";
import { Blockchain } from "../storage/blockchain.js";
import { Queue } from "../utils/linkedlist";
import Block from "../objects/block.js";
import { type ForkChainstateData } from "../storage/chainstate.js";
import { type ChainstateMsg, GetChainstateMsg } from "./messaging/messages/chainstate.js";
import { type PeerSocket } from "./socket.js";
import LeiCoinNetNode from "./index.js";
import { BlocksMsg, GetBlocksMsg } from "./messaging/messages/block.js";
import Verification from "../verification/index.js";

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

    private static async getRemoteAllBlocks(socket: PeerSocket, index: Uint64) {
        
        const blocksLeft = true;

        whileLoop: while (true) {

            const response = await socket.request<BlocksMsg>(new GetBlocksMsg(index, Uint64.from(512)));
            if (response.status !== 0 || !response.data) {
                break whileLoop;
            }
            const blocks = response.data.blocks;

            forLoop: for (const block of blocks) {
                const verification_result = await Verification.verifyMintedBlock(block);
                if (verification_result !== 12000) {
                    break forLoop;
                }
                Blockchain.blocks.add(block);
            }

            index = blocks[blocks.length - 1].index.add(1);

        }

    }

    static async checkRemoteChainstates() {
        const latestLocalBlockIndex = Blockchain.chainstate.getLatestBlock("main")?.index || 0;
        const remoteChainstatesPromise = this.getRemoteChainstates();
    }

    static async doStartupSync() {

        

    }

    static async syncChain() {
        
    }


}

