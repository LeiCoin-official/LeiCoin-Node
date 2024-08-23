import BCUtils from "./blockchainUtils.js";
import Chainstate from "./chainstate.js";
import Chain from "./chain.js";
import utils from "../utils/index.js";
import cli from "../cli/cli.js";


class Blockchain extends Chain {

    private static instance: Blockchain;

    public chainstate: Chainstate;
    public chains: {[chain: string]: Chain} = {};

    private constructor() {
        super("main");

        this.createStorageIfNotExists();
        this.registerOnShutdown();

        this.chainstate = Chainstate.getInstance();
        this.chains["main"] = this;
        for (const chainName in this.chainstate.getAllChainStates()) {
            if (chainName === "main") continue;
            this.chains[chainName] = new Chain(chainName);
        }

    }
    
    public static getInstance() {
        if (!Blockchain.instance) {
            Blockchain.instance = new Blockchain();
        }
        return Blockchain.instance;
    }

    private createStorageIfNotExists() {
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

    public async registerOnShutdown() {
        utils.events.once("stop_server", async () => {
            cli.data.info("Saving blockchain data...");

            await Promise.all(
                Object.values(this.chains).map(chain => chain.close())
            );
            this.chainstate.updateChainStateFile();

            cli.data.info("Blockchain data saved!");
        });
    }

}

export { type Blockchain };

export default Blockchain.getInstance();