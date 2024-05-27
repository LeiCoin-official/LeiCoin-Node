import Transaction from "../objects/transaction.js";
import Block from "../objects/block.js";
import { Callbacks } from "../utils/callbacks.js";
import { Uint256 } from "../utils/binary.js";

class Mempool {                                                                                                                                                                                                         

    private static instance: Mempool;

    public transactions: Map<string, Transaction>
  
    private constructor() {
        this.transactions = new Map();
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
    
        if (this.transactions.has(txid)) {
            //cli.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.transactions.set(txid, transaction);
        return { cb: Callbacks.SUCCESS };
    }
    
    // Function to remove a transaction from the Mempool
    public removeTransactionFromMempool(txid: Uint256) {
    
        if (this.transactions.has(txid)) {
            this.transactions.delete(txid);
            return { cb: Callbacks.SUCCESS };
        }
    
        //cli.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: Callbacks.NONE };
    }
    

}


const mempool = Mempool.getInstance();
export default mempool;