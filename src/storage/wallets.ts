import path from "path";
import { CB } from "../utils/callbacks.js";
import cli from "../cli/cli.js";
import Wallet from "../objects/wallet.js";
import BCUtils from "./blockchainUtils.js"
import Block from "../objects/block.js";
import blockchain from "./blockchain.js";
import { AddressHex } from "../objects/address.js";
import { Uint64 } from "../utils/binary.js";
import { RocksBasedStorage } from "./rocksdb/storageTypes.js";

export class WalletDB extends RocksBasedStorage {

    protected path = "/wallets";

    public async getWallet(address: AddressHex) {
        const raw_wallet = await this.level.get(address);
        return Wallet.fromDecodedHex(address, raw_wallet) || Wallet.createEmptyWallet(address);
    }

    public async setWallet(wallet: Wallet) {
        return this.level.put(wallet.owner, wallet.encodeToHex());
    }

    public async existsWallet(address: AddressHex): Promise<boolean> {
        const raw_wallet = await this.level.get(address);
        return Wallet.fromDecodedHex(address, raw_wallet) ? true : false;
    }

    public async addMoneyToWallet(address: AddressHex, amount: Uint64) {
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

    public async subtractMoneyFromWallet(address: AddressHex, amount: Uint64, adjustNonce = true) {
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

            const promises: Promise<void>[] = [];

            for (const transactionData of block.transactions) {
                const amount = transactionData.amount;
                promises.push(this.subtractMoneyFromWallet(transactionData.senderAddress, amount));
                promises.push(this.addMoneyToWallet(transactionData.recipientAddress, amount));
            }
    
            await Promise.all(promises);
            
            return { cb: CB.SUCCESS };

        } catch (err: any) {
            cli.data.error(`Error updating Wallets from Block ${block.index}: ${err.stack}`);
            return { cb: CB.ERROR };
        }
    }

}

export default WalletDB;
