import Transaction from "../objects/transaction.js";
import Block from "../objects/block.js";
import { CB } from "../utils/callbacks.js";
import { Uint256 } from "../binary/uint.js";
import { UintMap } from "../binary/map.js";

class Mempool {                                                                                                                                                                                                         

    private static instance: Mempool;

    public transactions: UintMap<Transaction>;
  
    private constructor() {
        this.transactions = new UintMap<Transaction>();
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
    
        if (txid.toHex() in this.transactions) {
            //cli.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.transactions.set(txid, transaction);
        return { cb: CB.SUCCESS };
    }
    
    // Function to remove a transaction from the Mempool
    public removeTransactionFromMempool(txid: Uint256) {
    
        if (txid.toHex() in this.transactions) {
            this.transactions.delete(txid);
            return { cb: CB.SUCCESS };
        }
    
        //cli.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: CB.NONE };
    }
    

}


const mempool = Mempool.getInstance();
export default mempool;