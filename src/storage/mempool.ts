import Transaction from "../objects/transaction.js";
import Block from "../objects/block.js";
import { Callbacks } from "../utils/callbacks.js";

class Mempool {

    public transactions: {
        [txid: string]: Transaction
    };                                                                                                                                                                                                              

    private static instance: Mempool;
  
    public constructor() {
        this.transactions = {};
    }
    
    public static getInstance() {
      if (!Mempool.instance) {
        Mempool.instance = new Mempool();
      }
      return Mempool.instance;
    }

    public clearMempoolbyBlock(block: Block) {

        for (const transactionData of block.transactions) {
            this.removeTransactionFromMempool(transactionData.txid);
        }

    }


    // Function to add a transaction to the Mempool
    public addTransactionToMempool(transaction: Transaction) {
        const txid = transaction.txid;
    
        if (this.transactions[txid]) {
            //cli.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.transactions[txid] = transaction;
        return { cb: Callbacks.SUCCESS };
    }
    
    // Function to remove a transaction from the Mempool
    public removeTransactionFromMempool(txid: string) {
    
        if (this.transactions[txid]) {
            delete this.transactions[txid];
            return { cb: Callbacks.SUCCESS };
        }
    
        //cli.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: Callbacks.NONE };
    }
    

}


const mempool = Mempool.getInstance();
export default mempool;