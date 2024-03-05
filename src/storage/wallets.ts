import { Level } from "level";
import path from "path";
import { Callbacks } from "../utils/callbacks.js";
import Transaction from "../objects/transaction.js";
import cli from "../utils/cli.js";
import Wallet from "../objects/wallet.js";
import encodingHandlers from "../handlers/encodingHandlers.js";
import { BlockchainUtils as BCUtils } from "./blockchainUtils.js"

export class WalletDB {

    private static instance: WalletDB;

    private level: Level;
  
    private constructor() {
        BCUtils.ensureDirectoryExists('/utxos');
        this.level = new Level(path.join(process.cwd(), "/blockchain_data/wallets"), {keyEncoding: "hex", valueEncoding: "hex"});
    }
    
    public static getInstance() {
        if (!WalletDB.instance) {
            WalletDB.instance = new WalletDB();
        }
        return WalletDB.instance;
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

    // Function to write a UTXO
    public async adjustWalletsByTransaction(transactionData: Transaction) {
        
        const senderAddress = transactionData.senderAddress
        const recipientAddress = transactionData.recipientAddress;
        const amount = transactionData.amount;

        try {
            
            const senderWallet = await this.getWallet(senderAddress);
            senderWallet.subtractMoneyIFPossible(amount);
            await this.setWallet(senderWallet);

            const recipientWallet = await this.getWallet(recipientAddress);
            recipientWallet.addMoney(amount);
            await this.setWallet(recipientWallet);

            return { cb: Callbacks.SUCCESS };

        } catch (err: any) {
            cli.data_message.error(`Error writing UTXOs for recipient address ${recipientAddress}: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }

}

export default WalletDB;