import fs from "fs";
import { Callbacks } from "../utils/callbacks.js";
import cli from "../utils/cli.js";
import { BlockchainUtils as BCUtils} from "./blockchainUtils.js";
import Chainstate from "./chainstate.js";
import Chain from "./chain.js";
import Block from "../objects/block.js";
import BigNum from "../utils/bigNum.js";

class Blockchain extends Chain {

    private static instance: Blockchain;

    public chainstate: Chainstate;
    public chains: {[chain: string]: Chain} = {};

    private constructor() {
        super("main");
        this.createStorageIfNotExists();
        this.chainstate = Chainstate.getInstance();
        this.chains["main"] = this;
        for (const chainName in this.chainstate.getChainState()) {
            if (chainName === "main") {
                continue;
            }
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
        BCUtils.ensureDirectoryExists('/forks');
    }
    
    public addTransactionsToIndex(txID: string, block: number, indexInBlock: number) {
        try {
            const filePath = `/utxos/${txID.slice(0, 4)}/${txID.slice(4, 8)}/${txID.slice(8, 12)}.json`;
            const fullFilePath = BCUtils.getBlockchainDataFilePath(filePath);
            const slicedTxID = txID.slice(12, txID.length);

            BCUtils.ensureFileExists(filePath, "{}");

            return { cb: Callbacks.SUCCESS };
        } catch (err: any) {
            cli.data_message.error(`Error adding transaction to indexes ${txID}: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }

    // Function to read a transaction
    public getTransaction(txID: string) {
        const txFilePath = BCUtils.getBlockchainDataFilePath(`/transactions/${txID}.json`);
        try {
            if (fs.existsSync(txFilePath)) {
                const data = fs.readFileSync(txFilePath, 'utf8');
                return {cb: Callbacks.SUCCESS, data: JSON.parse(data)}
            } else {
                cli.data_message.error(`Transaktion ${txID} was not found`);
                return {cb: Callbacks.NONE}
            }
        } catch (err: any) {
            cli.data_message.error(`Error reading transaction ${txID}: ${err.message}`);
            return {cb: Callbacks.ERROR};
        }
    }

    public createFork(name: string, parentChain: string, latestBlock: Block) {
        BCUtils.ensureDirectoryExists("/blocks", name);
        const parentLatestBlock = this.chainstate.getLatestBlockInfo(parentChain);
        const forkChain = new Chain(name);
        this.chains[name] = forkChain;
        this.chainstate.setChainState({
            parent: {
                name: parentChain,
                base: {

                }
            },
            previousBlockInfo: {
                index: BigNum.subtract(latestBlock.index, "1"),
                hash: latestBlock.previousHash
            },
            latestBlockInfo: latestBlock,
            tempWallets: {}
        });
    }

    public transferForkToMain(fork: string) {

        // we have to update this later

        try {

            const tempBlockchain = {};

            const forkBlocks = fs.readdirSync(BCUtils.getBlockchainDataFilePath("/blocks", fork));

            forkBlocks.sort((a: string, b: string) => {
                const numA = parseInt(a.split('.')[0]);
                const numB = parseInt(b.split('.')[0]);
                return numA - numB;
            });

            for (const blockFile of forkBlocks) {

                const blockIndex = blockFile.split('.')[0];

                const block = this.blocks.getBlock(blockIndex).data;
                if (!block) {
                    return { cb: Callbacks.ERROR };
                }

                const blockInMain = this.blocks.getBlock(blockIndex);

            }

            return { cb: Callbacks.SUCCESS };

        } catch (err: any) {
            cli.data_message.error(`Error transfering Fork ${fork} to Main Blockchain: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }

    }

    public deleteFork(name: string) {
        
    }

}

export default Blockchain.getInstance();