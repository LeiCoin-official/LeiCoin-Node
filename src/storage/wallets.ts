import { Level } from "level";
import path from "path";
import { Callbacks } from "../utils/callbacks.js";
import cli from "../utils/cli.js";
import Wallet from "../objects/wallet.js";
import encodingHandlers from "../handlers/encodingHandlers.js";
import { BlockchainUtils as BCUtils } from "./blockchainUtils.js"
import Block from "../objects/block.js";
import blockchain from "./blockchain.js";

export class WalletDB {

    private readonly level: Level;
    private readonly chain: string;

    constructor(chain = "main") {
        BCUtils.ensureDirectoryExists('/wallets', chain);
        this.chain = chain;
        this.level = new Level(path.join(BCUtils.getBlockchainDataFilePath("/wallets", chain)), {keyEncoding: "hex", valueEncoding: "hex"});
    }

    public async getWallet(address: string) {
        const encodeAddress = encodingHandlers.encodeAddressToHex(address);
        const raw_wallet = await this.level.get(encodeAddress);
        return Wallet.fromDecodedHex(address, raw_wallet) || Wallet.createEmptyWallet(address);
    }

    public async setWallet(wallet: Wallet) {
        const encodeAddress = encodingHandlers.encodeAddressToHex(wallet.owner);
        const encodedWallet = wallet.encodeToHex();
        return await this.level.put(encodeAddress, encodedWallet);
    }

    public async existsWallet(address: string): Promise<boolean> {
        const encodeAddress = encodingHandlers.encodeAddressToHex(address);
        const raw_wallet = await this.level.get(encodeAddress);
        return Wallet.fromDecodedHex(address, raw_wallet) ? true : false;
    }

    public async addMoneyToWallet(address: string, amount: string) {
        const wallet = await this.getWallet(address);
        if (this.chain === "main") {
            for (const [chainName, chain] of Object.entries(blockchain.chains)) {
                if (chainName === "main") continue;
                if (!(await chain.wallets.existsWallet(address))) {
                    chain.wallets.setWallet(wallet);
                }
            }
        }
        wallet.addMoney(amount);
        await this.setWallet(wallet);
    }

    public async subtractMoneyFromWallet(address: string, amount: string, adjustNonce = true) {
        const wallet = await this.getWallet(address);
        if (this.chain === "main") {
            for (const [chainName, chain] of Object.entries(blockchain.chains)) {
                if (chainName === "main") continue;
                if (!(await chain.wallets.existsWallet(address))) {
                    chain.wallets.setWallet(wallet);
                }
            }
        }
        if (adjustNonce) {
            wallet.adjustNonce();
        }
        wallet.subtractMoneyIFPossible(amount);
        await this.setWallet(wallet);
    }

    public async adjustWalletsByBlock(block: Block) {
        try {

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