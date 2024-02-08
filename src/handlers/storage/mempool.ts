import {AddedUTXO, DeletedUTXO, UTXO} from "../../objects/utxo.js";
import Transaction from "../../objects/transaction.js";
import Block from "../../objects/block.js";    

class Mempool {

    public transactions: {
        [txid: string]: Transaction
    };                                                                                                                                                                                                              
    public deleted_utxos: {
        [senderAddress: string]: {
            [utxoid: string]: DeletedUTXO
        }
    };
    public added_utxos: {
        [recipientAddress: string]: {
            [utxoid: string]: AddedUTXO
        }
    };

    private static instance: Mempool | null = null;
  
    private constructor() {

        this.transactions = {};
        this.deleted_utxos = {};
        this.added_utxos = {};

    }
    
    public static getInstance(): Mempool {
      if (!Mempool.instance) {
        Mempool.instance = new Mempool();
      }
      return Mempool.instance;
    }

    public clearMempoolbyBlock(block: Block) {

        for (const [txid, transactionData] of Object.entries(block.transactions)) {
            this.removeTransactionFromMempool(transactionData.txid);
            for (const input of transactionData.input) {
                this.removeDeletedUTXOFromMempool(transactionData.senderAddress, input.utxoid);
            }
            for (const [index, output] of transactionData.output.entries()) {
                this.removeAddedUTXOFromMempool(output.recipientAddress, `${txid}_${index}`);
            }
        }
    }

        // Function to add a utxo to the list of deleted utxos of the Mempool
    public addDeletedUTXOToMempool(senderAddress: string, utxoid: string, utxo_data: DeletedUTXO) {

        this.deleted_utxos[senderAddress] = this.deleted_utxos[senderAddress] || [];

        if (this.deleted_utxos[senderAddress][utxoid]) {
            //utils.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of deleted utxos in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.deleted_utxos[senderAddress][utxoid] = utxo_data;
        return { cb: 'success' };
    }
    
    // Function to remove a utxo from the list of deleted utxos of the Mempool
    public removeDeletedUTXOFromMempool(senderAddress: string, utxoid: string) {

        if (this.deleted_utxos[senderAddress] && this.deleted_utxos[senderAddress][utxoid]) {
            
            delete this.deleted_utxos[senderAddress][utxoid];

            if (this.deleted_utxos[senderAddress].length === 0)
                delete this.deleted_utxos[senderAddress];

            return { cb: 'success' };
        }
    
        //utils.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of deleted utxos in the Mempool.`);
        return { cb: 'none' };
    }

    // Function to add a utxo to the list of added utxos of the Mempool
    public addAddedUTXOToMempool(recipientAddress: string, utxoid: string, utxo_data: AddedUTXO) {

        this.added_utxos[recipientAddress] = this.added_utxos[recipientAddress] || {};

        if (this.added_utxos[recipientAddress][utxoid]) {
            //utils.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of added utxos in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.added_utxos[recipientAddress][utxoid] = utxo_data;
        return { cb: 'success' };
    }
    
    // Function to remove a utxo from the list of added utxo of the Mempool
    public removeAddedUTXOFromMempool(recipientAddress: string, utxoid: string) {

        if (this.added_utxos[recipientAddress] && this.added_utxos[recipientAddress][utxoid]) {

            delete this.added_utxos[recipientAddress][utxoid];

            if (Object.keys(this.added_utxos[recipientAddress]).length === 0)
                delete this.added_utxos[recipientAddress];

            return { cb: 'success' };
        }
    
        //utils.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of added utxos in the Mempool.`);
        return { cb: 'none' };
    }

    // Function to add a transaction to the Mempool
    public addTransactionToMempool(transaction: Transaction) {
        const txid = transaction.txid;
    
        if (this.transactions[txid]) {
            //utils.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.transactions[txid] = transaction;
        return { cb: 'success' };
    }
    
    // Function to remove a transaction from the Mempool
    public removeTransactionFromMempool(txid: string) {
    
        if (this.transactions[txid]) {
            delete this.transactions[txid];
            return { cb: 'success' };
        }
    
        //utils.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: 'none' };
    }
    

}

export default Mempool.getInstance();