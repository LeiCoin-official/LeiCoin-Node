import { Transaction } from "@leicoin/objects/transaction";
import { Block } from "@leicoin/objects/block";
import { CB } from "@leicoin/utils/callbacks";
import { Uint256 } from "low-level";
import { UintMap } from "low-level";

export class Mempool {                                                                                                                                                                                                         

    static readonly transactions = new UintMap<Transaction>();
  
    private constructor() {}

    static clearMempoolbyBlock(block: Block) {

        for (const transactionData of block.body.transactions) {
            this.removeTransactionFromMempool(transactionData.txid);
        }

    }

    // Function to add a transaction to the Mempool
    static addTransactionToMempool(transaction: Transaction) {
        const txid = transaction.txid;
    
        if (txid.toHex() in this.transactions) {
            //cli.data_message.error(`Transaction ${transactionHash} already exists in the Mempool.`);
            return { cb: 'exists' };
        }
    
        this.transactions.set(txid, transaction);
        return { cb: CB.SUCCESS };
    }
    
    // Function to remove a transaction from the Mempool
    static removeTransactionFromMempool(txid: Uint256) {
    
        if (txid.toHex() in this.transactions) {
            this.transactions.delete(txid);
            return { cb: CB.SUCCESS };
        }
    
        //cli.data_message.error(`Transaction ${transactionHash} not found in the Mempool.`);
        return { cb: CB.NONE };
    }
    

}

