import {AddedUTXO, DeletedUTXO, UTXO} from "./utxo";
import Transaction from "./transaction";
import Block from "./block";    

class Mempool {

    public transactions: {[key: string]: Transaction};                                                                                                                                                                                                              
    public deleted_utxos: {[key: string]: DeletedUTXO[]};
    public added_utxos: {[key: string]: AddedUTXO[]};

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
            this.removeTransactionFromMempool(transactionData);
            for (const input of transactionData.input) {
                this.removeDeletedUTXOFromMempool(transactionData.senderAddress, input.utxoid);
            }
            for (const [index, output] of transactionData.output.entries()) {
                this.removeAddedUTXOFromMempool(output.recipientAddress, `${txid}_${index}`);
            }
        }
    }

        // Function to add a utxo to the list of deleted utxos of the Mempool
    public addDeletedUTXOToMempool(senderAddress: string, utxo: DeletedUTXO) {

        mempool.deleted_utxos[senderAddress] = mempool.deleted_utxos[senderAddress] || [];

        if (mempool.deleted_utxos[senderAddress].includes(utxo)) {
            //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of deleted utxos in the Mempool.`);
            return { cb: 'exists' };
        }
    
        mempool.deleted_utxos[senderAddress].push(utxo);
        return { cb: 'success' };
    }
    
    // Function to remove a utxo from the list of deleted utxos of the Mempool
    public removeDeletedUTXOFromMempool(senderAddress: string, utxo: DeletedUTXO) {

        if (mempool.deleted_utxos[senderAddress] && mempool.deleted_utxos[senderAddress].includes(utxo)) {
            
            mempool.deleted_utxos[senderAddress].splice(mempool.deleted_utxos[senderAddress].indexOf(utxo), 1);

            if (mempool.deleted_utxos[senderAddress].length === 0) delete mempool.deleted_utxos[senderAddress];

            return { cb: 'success' };
        }
    
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of deleted utxos in the Mempool.`);
        return { cb: 'none' };
    }

    // Function to add a utxo to the list of added utxos of the Mempool
    public addAddedUTXOToMempool(recipientAddress: string, utxo: AddedUTXO) {

        mempool.added_utxos[recipientAddress] = mempool.added_utxos[recipientAddress] || {};

        if (mempool.added_utxos[recipientAddress].includes(utxo)) {
            //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of added utxos in the Mempool.`);
            return { cb: 'exists' };
        }
    
        mempool.added_utxos[recipientAddress].push(utxo);
        return { cb: 'success' };
    }
    
    // Function to remove a utxo from the list of added utxo of the Mempool
    public removeAddedUTXOFromMempool(recipientAddress: string, utxo: AddedUTXO) {

        if (mempool.added_utxos[recipientAddress] && mempool.added_utxos[recipientAddress].includes(utxo)) {
            mempool.added_utxos[recipientAddress].splice(mempool.added_utxos[recipientAddress].indexOf(utxo), 1);

            if (Object.keys(mempool.added_utxos[recipientAddress]).length === 0)
                delete mempool.added_utxos[recipientAddress];

            return { cb: 'success' };
        }
    
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of added utxos in the Mempool.`);
        return { cb: 'none' };
    }

        // Function to add a transaction to the Mempool
    public addTransactionToMempool(transaction: Transaction) {
        const txid = transaction.txid;
    
        if (mempool.transactions[txid]) {
            //util.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        mempool.transactions[txid] = transaction;
        return { cb: 'success' };
    }
    
    // Function to remove a transaction from the Mempool
    public removeTransactionFromMempool(transaction: Transaction) {
        const txid = transaction.txid;
    
        if (mempool.txid[transactionHash]) {
            delete mempool.transactions[transactionHash];
            return { cb: 'success' };
        }
    
        //util.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: 'none' };
    }
    

}

const mempool = Mempool.getInstance();
export default mempool;