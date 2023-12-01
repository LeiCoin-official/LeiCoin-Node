import UTXO from "./utxo";
import Transaction from "./transaction";
import Block from "./block";    

class Mempool {

    public transactions: {[key: string]: Transaction};
    public deleted_utxos: {[key: string]: UTXO[]};
    public added_utxos: {[key: string]: UTXO[]};

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

    public clearMempool(block: Block) {

        for (const [, transactionData] of Object.entries(block.transactions)) {
            this.removeTransactionFromMempool(transactionData);
            for (const input of transactionData.input) {
                this.removeDeletedUTXOFromMempool(transactionData.senderAddress, `${input.txid}_${input.index}`);
            }
            for (const output of transactionData.output) {
                this.removeAddedUTXOFromMempool(output.recipientAddress, `${output.txid}_${output.index}`);
            }
        }
    }

        // Function to add a utxo to the list of deleted utxos of the Mempool
    public addDeletedUTXOToMempool(senderAddress: string, utxo: any) {

        mempool.deleted_utxos[senderAddress] = mempool.deleted_utxos[senderAddress] || [];

        if (mempool.deleted_utxos[senderAddress].includes(utxo)) {
            //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of deleted utxos in the Mempool.`);
            return { cb: 'exists' };
        }
    
        mempool.deleted_utxos[senderAddress].push(utxo);
        return { cb: 'success' };
    }
    
    // Function to remove a utxo from the list of deleted utxos of the Mempool
    public removeDeletedUTXOFromMempool(senderAddress: string | number, utxo: string) {

        if (mempool.deleted_utxos[senderAddress] && mempool.deleted_utxos[senderAddress].includes(utxo)) {
            
            mempool.deleted_utxos[senderAddress].splice(mempool.deleted_utxos.indexOf(utxo), 1);

            if (mempool.deleted_utxos[senderAddress].length === 0) delete mempool.deleted_utxos[senderAddress];

            return { cb: 'success' };
        }
    
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of deleted utxos in the Mempool.`);
        return { cb: 'none' };
    }

    // Function to add a utxo to the list of added utxos of the Mempool
    public addAddedUTXOToMempool(recipientAddress: string, utxo: string, amount: any) {

        mempool.added_utxos[recipientAddress] = mempool.added_utxos[recipientAddress] || {};

        if (mempool.added_utxos[recipientAddress][utxo]) {
            //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of added utxos in the Mempool.`);
            return { cb: 'exists' };
        }
    
        mempool.added_utxos[recipientAddress][utxo] = {amount: amount};
        return { cb: 'success' };
    }
    
    // Function to remove a utxo from the list of added utxo of the Mempool
    public removeAddedUTXOFromMempool(recipientAddress: string, utxo: string) {

        if (mempool.added_utxos[recipientAddress] && mempool.added_utxos[recipientAddress][utxo]) {
            delete mempool.added_utxos[recipientAddress][utxo];

            if (Object.keys(mempool.added_utxos[recipientAddress]).length === 0) delete mempool.added_utxos[recipientAddress];

            return { cb: 'success' };
        }
    
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of added utxos in the Mempool.`);
        return { cb: 'none' };
    }

        // Function to add a transaction to the Mempool
    public addTransactionToMempool(transaction: { txid: any; }) {
        const transactionHash = transaction.txid;
    
        if (mempool.transactions[transactionHash]) {
            //util.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        mempool.transactions[transactionHash] = transaction;
        return { cb: 'success' };
    }
    
    // Function to remove a transaction from the Mempool
    public removeTransactionFromMempool(transaction: { txid: any; }) {
        const transactionHash = transaction.txid;
    
        if (mempool.transactions[transactionHash]) {
            delete mempool.transactions[transactionHash];
            return { cb: 'success' };
        }
    
        //util.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: 'none' };
    }
    

}

const mempool = Mempool.getInstance();
export default mempool;