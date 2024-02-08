import { addTransactionToMempool, addDeletedUTXOToMempool, addAddedUTXOToMempool, removeAddedUTXOFromMempool, mempool } from "../../../handlers/dataHandler.js";
import utils from "../../../utils.js";
import validation from "../../../validation.js";

module.exports = function (transaction) {

    if (!(transaction.txid in mempool.transactions)) {

        const validationresult = validation.isValidTransaction(transaction);

        if (validationresult.cb) {

            // Add the transaction to the mempool (replace with your blockchain logic)
            addTransactionToMempool(transaction);
    
            for (const input of transaction.input) {
                const removeAddedUTXOFromMempoolResult = removeAddedUTXOFromMempool(transaction.senderAddress, `${input.txid}_${input.index}`);
                if (removeAddedUTXOFromMempoolResult.cb !== "success") {
                    addDeletedUTXOToMempool(transaction.senderAddress, `${input.txid}_${input.index}`);
                }
            }
            for (const output of transaction.output) {
                addAddedUTXOToMempool(output.recipientAddress, `${transaction.txid}_${output.index}`, output.amount);
            }
    
            utils.ws_client_message.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);
        } else {
            utils.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
        }

        return {cb: true, validationresult: validationresult };
    }

    //utils.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);
	return { cb: false, validationresult: null };

}
