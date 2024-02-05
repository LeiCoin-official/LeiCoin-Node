class Mempool {
    constructor() {
        this.transactions = {};
        this.deleted_utxos = {};
        this.added_utxos = {};
    }
    static getInstance() {
        if (!Mempool.instance) {
            Mempool.instance = new Mempool();
        }
        return Mempool.instance;
    }
    clearMempoolbyBlock(block) {
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
    addDeletedUTXOToMempool(senderAddress, utxoid, utxo_data) {
        mempool.deleted_utxos[senderAddress] = mempool.deleted_utxos[senderAddress] || [];
        if (mempool.deleted_utxos[senderAddress][utxoid]) {
            //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of deleted utxos in the Mempool.`);
            return { cb: 'exists' };
        }
        mempool.deleted_utxos[senderAddress][utxoid] = utxo_data;
        return { cb: 'success' };
    }
    // Function to remove a utxo from the list of deleted utxos of the Mempool
    removeDeletedUTXOFromMempool(senderAddress, utxoid) {
        if (mempool.deleted_utxos[senderAddress] && mempool.deleted_utxos[senderAddress][utxoid]) {
            delete mempool.deleted_utxos[senderAddress][utxoid];
            if (mempool.deleted_utxos[senderAddress].length === 0)
                delete mempool.deleted_utxos[senderAddress];
            return { cb: 'success' };
        }
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of deleted utxos in the Mempool.`);
        return { cb: 'none' };
    }
    // Function to add a utxo to the list of added utxos of the Mempool
    addAddedUTXOToMempool(recipientAddress, utxoid, utxo_data) {
        mempool.added_utxos[recipientAddress] = mempool.added_utxos[recipientAddress] || {};
        if (mempool.added_utxos[recipientAddress][utxoid]) {
            //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} already exists in the list of added utxos in the Mempool.`);
            return { cb: 'exists' };
        }
        mempool.added_utxos[recipientAddress][utxoid] = utxo_data;
        return { cb: 'success' };
    }
    // Function to remove a utxo from the list of added utxo of the Mempool
    removeAddedUTXOFromMempool(recipientAddress, utxoid) {
        if (mempool.added_utxos[recipientAddress] && mempool.added_utxos[recipientAddress][utxoid]) {
            delete mempool.added_utxos[recipientAddress][utxoid];
            if (Object.keys(mempool.added_utxos[recipientAddress]).length === 0)
                delete mempool.added_utxos[recipientAddress];
            return { cb: 'success' };
        }
        //util.data_message.error(`UTXO with TxID: ${utxo.txid}, Index: ${utxo.index} not found in the list of added utxos in the Mempool.`);
        return { cb: 'none' };
    }
    // Function to add a transaction to the Mempool
    addTransactionToMempool(transaction) {
        const txid = transaction.txid;
        if (mempool.transactions[txid]) {
            //util.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
        mempool.transactions[txid] = transaction;
        return { cb: 'success' };
    }
    // Function to remove a transaction from the Mempool
    removeTransactionFromMempool(txid) {
        if (mempool.transactions[txid]) {
            delete mempool.transactions[txid];
            return { cb: 'success' };
        }
        //util.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: 'none' };
    }
}
Mempool.instance = null;
const mempool = Mempool.getInstance();
export default mempool;
