import BCUtils from "./blockchainUtils.js";
import Chainstate from "./chainstate.js";
import Chain from "./chain.js";
import utils from "../utils/index.js";
import cli from "../cli/cli.js";
import { BasicModuleLike } from "../utils/dataUtils.js";

export class Blockchain implements BasicModuleLike<typeof Blockchain> {

    static chainstate: Chainstate;
    static readonly chains: {[chain: string]: Chain} = {};

    static get name() { return "main" }
    static get blocks() { return this.chains["main"].blocks }
    static get wallets() { return this.chains["main"].wallets }
    static get cstates() { return this.chains["main"].cstates }
    static get minters() { return this.chains["main"].minters }

    static async init() {
        this.createStorageIfNotExists();
        this.setupEvents();

        this.chainstate = Chainstate.getInstance();
        for (const chainName in this.chainstate.getAllChainStates()) {
            this.chains[chainName] = new Chain(chainName);
        }

    }

    private static createStorageIfNotExists() {
        BCUtils.ensureDirectoryExists('/forks', "main");
    }

    // public async createFork(name: string, parentChain: string, latestBlock: Block) {
    //     const parentLatestBlock = this.chainstate.getLatestBlockInfo(parentChain);

    //     if (parentChain !== "main") {
    //         fs.cpSync(BCUtils.getBlockchainDataFilePath("", parentChain), BCUtils.getBlockchainDataFilePath("", name), { recursive: true });
    //         fs.unlinkSync(BCUtils.getBlockchainDataFilePath(`/blocks/${parentLatestBlock.index}.lcb`, name));
    //     }

    //     const forkChain = new Chain(name);
    //     this.chains[name] = forkChain;
    //     this.chainstate.setChainState({
    //         parent: {
    //             name: parentChain
    //         },
    //         // base: {
    //         //     index: latestBlock.index,
    //         //     hash: latestBlock.hash,
    //         // },
    //         base: latestBlock,
    //         // previousBlockInfo: {
    //         //     index: latestBlock.index.sub(1),
    //         //     hash: latestBlock.previousHash
    //         // },
    //         previousBlockInfo: this.blocks.getBlock(latestBlock.index.sub(1).toHex()).data as Block,
    //         latestBlockInfo: latestBlock
    //     });

    //     for (const transactionData of parentLatestBlock.transactions) {
    //         const senderWallet = await this.chains[parentChain].wallets.getWallet(transactionData.senderAddress);
    //         const recipientWallet = await this.chains[parentChain].wallets.getWallet(transactionData.recipientAddress);

    //         senderWallet.adjustNonce(-1);
    //         senderWallet.addMoney(transactionData.amount);
    //         recipientWallet.subtractMoneyIFPossible(transactionData.amount);

    //         await forkChain.wallets.setWallet(senderWallet);
    //         await forkChain.wallets.setWallet(recipientWallet);
    //     }
    // }

    // public transferForkToMain(fork: string) {

    //     // we have to update this later
    //     try {

    //         const tempBlockchain = {};

    //         const forkBlocks = fs.readdirSync(BCUtils.getBlockchainDataFilePath("/blocks", fork));

    //         forkBlocks.sort((a: string, b: string) => {
    //             const numA = parseInt(a.split('.')[0]);
    //             const numB = parseInt(b.split('.')[0]);
    //             return numA - numB;
    //         });

    //         for (const blockFile of forkBlocks) {

    //             const blockIndex = blockFile.split('.')[0];

    //             const block = this.blocks.getBlock(blockIndex).data;
    //             if (!block) {
    //                 return { cb: CB.ERROR };
    //             }

    //             const blockInMain = this.blocks.getBlock(blockIndex);

    //         }

    //         return { cb: CB.SUCCESS };

    //     } catch (err: any) {
    //         cli.data.error(`Error transfering Fork ${fork} to Main Blockchain: ${err.stack}`);
    //         return { cb: CB.ERROR };
    //     }

    // }

    // public deleteFork(name: string) {
        
    // }

    private static async setupEvents() {
        utils.events.once("stop_server", async () => {
            await this.stop();
        });
    }

    static async stop() {
        cli.data.info("Saving blockchain data...");

        await Promise.all(
            Object.values(this.chains).map(chain => chain.close())
        );
        this.chainstate.updateChainStateFile();

        cli.data.info("Blockchain data saved!");
    }

}

