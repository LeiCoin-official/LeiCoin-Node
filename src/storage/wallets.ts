import { Level } from "level";
import path from "path";
import { Callbacks } from "../utils/callbacks.js";
import Transaction from "../objects/transaction.js";
import cli from "../utils/cli.js";
import Wallet from "../objects/wallet.js";
import encodingHandlers from "../handlers/encodingHandlers.js";
import { BlockchainUtils as BCUtils } from "./blockchainUtils.js"
import Block from "../objects/block.js";
import blockchain from "./blockchain.js";
import BigNum from "../utils/bigNum.js";

export class WalletDB {

    private level: Level;
    private chain: string;

    constructor(chain = "main") {
        BCUtils.ensureDirectoryExists('/wallets');
        this.chain = chain;
        this.level = new Level(path.join(BCUtils.getBlockchainDataFilePath("/wallets")), {keyEncoding: "hex", valueEncoding: "hex"});
    }

    public async getWallet(address: string) {
        const encodeAddress = encodingHandlers.encodeAddressToHex(address);
        const raw_wallet = await this.level.get(encodeAddress);
        return Wallet.fromDecodedHex(address, raw_wallet);
        
    }

    public async setWallet(wallet: Wallet) {
        const encodeAddress = encodingHandlers.encodeAddressToHex(wallet.owner);
        const encodedWallet = wallet.encodeToHex();
        return await this.level.put(encodeAddress, encodedWallet);
    }

    public async addMoneyToWallet(address: string, amount: string) {
        const wallet = await this.getWallet(address);
        wallet.addMoney(amount);
        await this.setWallet(wallet);
    }

    public async subtractMoneyFromWallet(address: string, amount: string) {
        const wallet = await this.getWallet(address);
        wallet.subtractMoneyIFPossible(amount);
        await this.setWallet(wallet);
    }

    public async adjustWalletsByBlock(block: Block) {

        try {

            let maxBlockHeight = block.index;

            for (const [, chain] of Object.entries(blockchain.chainstate.getChainState())) {
                const chainBaseBlockHeight = chain.parent.base.index;
                maxBlockHeight = BigNum.min(block.index, chainBaseBlockHeight);
            }

            const promises = [];

            for (const transactionData of block.transactions) {
                const amount = transactionData.amount;
                promises.push(this.subtractMoneyFromWallet(transactionData.senderAddress, amount));
                promises.push(this.addMoneyToWallet(transactionData.recipientAddress, amount));
            }

            Promise.all(promises);
            
            return { cb: Callbacks.SUCCESS };

        } catch (err: any) {
            cli.data_message.error(`Error updating Wallets from Block ${block.index}: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }

}

export default WalletDB;