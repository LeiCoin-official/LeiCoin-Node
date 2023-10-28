const { addTransactionToMempool, addDeletedUTXOToMempool, addAddedUTXOToMempool, removeAddedUTXOFromMempool, mempool } = require('../../../handlers/dataHandler');
const util = require('../../../utils');
const validation = require('../../../validation');

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
    
            util.ws_client_message.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Blockchain.`);
        } else {
            util.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
        }

        return {cb: true, validationresult: validationresult };
    }

    util.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);
	return { cb: false, validationresult: null };

}
