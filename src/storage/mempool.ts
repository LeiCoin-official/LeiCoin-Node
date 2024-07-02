import Transaction from "../objects/transaction.js";
import Block from "../objects/block.js";
import { CB } from "../utils/callbacks.js";
import { Uint256 } from "../utils/binary.js";
import { Dict } from "../utils/dataUtils.js";

class Mempool {                                                                                                                                                                                                         

    private static instance: Mempool;

    public transactions: Dict<Transaction>;
  
    private constructor() {
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
    
        if (txid.toHex() in this.transactions) {
            //cli.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.transactions[txid.toHex()] = transaction;
        return { cb: CB.SUCCESS };
    }
    
    // Function to remove a transaction from the Mempool
    public removeTransactionFromMempool(txid: Uint256) {
    
        if (txid.toHex() in this.transactions) {
            delete this.transactions[txid.toHex()];
            return { cb: CB.SUCCESS };
        }
    
        //cli.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: CB.NONE };
    }
    

}


const mempool = Mempool.getInstance();
export default mempool;