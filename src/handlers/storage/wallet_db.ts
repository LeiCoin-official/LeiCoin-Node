import { Level } from "level";
import path from "path";
import { Callbacks } from "../../utils/callbacks.js";
import storage_utils from "../../utils/storage_utils.js";
import Transaction from "../../objects/transaction.js";
import cli from "../../utils/cli.js";
import Wallet from "../../objects/wallet.js";


export default class WalletDB {

    private static instance: WalletDB;

    private level: Level;
  
    private constructor() {
        this.level = new Level(path.join(process.cwd(), "/blockchain_data/wallets"), {keyEncoding: "hex", valueEncoding: "hex"});
    }
    
    public static getInstance(): WalletDB {
        if (!WalletDB.instance) {
            WalletDB.instance = new WalletDB();
        }
        return WalletDB.instance;
    }
    
    private encodeAddressToHexKey(address: string) {
        return address.slice(2, address.length).replace("x", "0");
    }

    private decodeHexKeyToAddress(hexKey: string) {
        const splitetHexKey = hexKey.split("");

        splitetHexKey[1] = splitetHexKey[1].replace("0", "x");
        const address = "lc" + splitetHexKey.join("");
        return address;
    }

    private encodeWalletToHexValue(wallet: Wallet) {
    
        const encoded_balance = storage_utils.compressZeros(wallet.getBalance().toString());
        const balance_length = encoded_balance.length.toString().padStart(2, "0");
    
        const encoded_nonce = storage_utils.compressZeros(wallet.getNonce().toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        let hexData = wallet.version + 
                        balance_length + 
                        encoded_balance + 
                        nonce_length + 
                        encoded_nonce;

        const empty_bytes = hexData.length % 2 !== 0 ? "0" : "";
        
        return hexData + empty_bytes;
    
    }
    
    private decodeHexValueToWallet(ownerAddress: string, hexValue: string) {

        const version = hexValue.substring(0, 2);
    
        if (version === "00") {
    
            const balance_length_string = hexValue.substring(2, 4);
            const balance_length = parseInt(balance_length_string);

            const raw_balance = hexValue.substring(4, 4 + balance_length);
            const decoded_balance = BigInt(storage_utils.decompressZeros(raw_balance));
    
            const nonce_length_string = hexValue.substring(4 + balance_length, 6 + balance_length);
            const nonce_length = parseInt(nonce_length_string);

            const raw_nonce = hexValue.substring(6 + balance_length, 6 + balance_length + nonce_length);
            const decoded_nonce = parseInt(raw_nonce);
                
            if (
                (version.length !== 2) ||
                (balance_length_string.length !== 2) ||
                (raw_balance.length !== balance_length) ||
                (nonce_length_string.length !== 2) ||
                (raw_nonce.length !== nonce_length)
            ) {
                return Wallet.createEmptyWallet(ownerAddress);
            }

            return {
                cb: Callbacks.SUCCESS,
                wallet: new Wallet(ownerAddress, decoded_balance, decoded_nonce, version)
            };
        }

        return Wallet.createEmptyWallet(ownerAddress);
    }


    // Function to write a UTXO
    public adjustWalletsByTransaction(transactionData: Transaction) {
        
        // Iterate through the recipients in the output array
        for (const [index, output] of transactionData.output.entries()) {
            const recipientAddress = output.recipientAddress;
            try {
    
                this.level.get(output.recipientAddress).then

            } catch (err: any) {
                cli.data_message.error(`Error writing UTXOs for recipient address ${recipientAddress}: ${err.message}`);
                return { cb: Callbacks.ERROR };
            }
        }
    
        return { cb: Callbacks.SUCCESS };
    }
    
    // Function to read a UTXO
    public getUTXOS(address: string, utxoid: string | null = null) {
    
        try {
    
            const utxoFilePath = this.getUTXOFilePath(address);

            const slicedAddress = address.slice(12, address.length);
    
            // Check if the UTXO file for the address exists
            const fullFilePath = this.getBlockchainDataFilePath(utxoFilePath);
            if (fs.existsSync(fullFilePath)) {
                const existingData = fs.readFileSync(fullFilePath, 'utf8');
                const existingUTXOs: UTXOFileData = JSON.parse(existingData);
                const addressUTXOs = existingUTXOs[slicedAddress];

                if (!addressUTXOs) {
                    return { cb: Callbacks.NONE };
                }

                if (mempool instanceof MempoolWithUnconfirmedUTXOS) {
                    if (mempool.deleted_utxos[address]) {
                        for (const [utxoid, ] of Object.entries(mempool.deleted_utxos[address])) {
                            delete addressUTXOs[utxoid];
                        }
                    }
                    if (mempool.added_utxos[address]) {
                        for (const [added_utxo, added_utxo_content] of Object.entries(mempool.added_utxos[address])) {
                            addressUTXOs[added_utxo] = added_utxo_content;
                        }
                    }
                }
    
                if (utxoid === null) {
                    return { cb: Callbacks.SUCCESS, data: addressUTXOs };
                } else {
                    const utxo = addressUTXOs[utxoid];
                
                    if (utxo) {
                        return { cb: Callbacks.SUCCESS, data: utxo };
                    }
                }
    
                return { cb: Callbacks.NONE };
            } else {
                return { cb: Callbacks.NONE };
            }
        } catch (err: any) {
            cli.data_message.error(`Error reading UTXOs for recipient address ${address}: ${err.message}`);
            return { cb: Callbacks.ERROR };
        }
    }

}

