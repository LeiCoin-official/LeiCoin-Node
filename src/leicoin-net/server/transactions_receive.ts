import mempool from "../../handlers/storage/mempool.js";
import Transaction from "../../objects/transaction.js";
import { AddedUTXO, DeletedUTXO } from "../../objects/utxo.js";
import utils from "../../utils.js";
import { Callbacks } from "../../utils/callbacks.js";
import validation from "../../validation.js";

export default function (transaction: Transaction) {

    if (!(transaction.txid in mempool.transactions)) {

        const validationresult = validation.isValidTransaction(transaction);

        if (validationresult.cb) {

            // Add the transaction to the mempool (replace with your blockchain logic)
            mempool.addTransactionToMempool(transaction);
    
            for (const input of transaction.input) {
                const removeAddedUTXOFromMempoolResult = mempool.removeAddedUTXOFromMempool(transaction.senderAddress, input.utxoid);
                if (removeAddedUTXOFromMempoolResult.cb === Callbacks.NONE) {
                    mempool.addDeletedUTXOToMempool(transaction.senderAddress, input.utxoid, DeletedUTXO.initFromTXInput(input));
                }
            }
            for (const [index, output] of transaction.output.entries()) {
                mempool.addAddedUTXOToMempool(output.recipientAddress, `${transaction.txid}_${index}`, AddedUTXO.initFromTXOutput(output));
            }
    
            utils.leicoin_net_message.server.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);
        } else {
            utils.leicoin_net_message.server.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
        }

        return {cb: true, validationresult: validationresult };
    }

    //utils.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);
	return { cb: false, validationresult: null };

}
