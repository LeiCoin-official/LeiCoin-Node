import mempool, { MempoolWithUnconfirmedUTXOS } from "../../handlers/storage/mempool.js";
import Transaction from "../../objects/transaction.js";
import { AddedUTXO, DeletedUTXO } from "../../objects/utxo.js";
import { Callbacks } from "../../utils/callbacks.js";
import cli from "../../utils/cli.js";
import utils from "../../utils/utils.js";
import validation from "../../validation.js";

export default function (data: any) {

    const transaction = utils.createInstanceFromJSON(Transaction, data);

    if (!(transaction.txid in mempool.transactions)) {

        const validationresult = validation.isValidTransaction(transaction);

        if (validationresult.cb) {

            // Add the transaction to the mempool (replace with your blockchain logic)
            mempool.addTransactionToMempool(transaction);
            
            if (mempool instanceof MempoolWithUnconfirmedUTXOS) {
                for (const input of transaction.input) {
                    const removeAddedUTXOFromMempoolResult = mempool.removeAddedUTXOFromMempool(transaction.senderAddress, input.utxoid);
                    if (removeAddedUTXOFromMempoolResult.cb === Callbacks.NONE) {
                        mempool.addDeletedUTXOToMempool(transaction.senderAddress, input.utxoid, DeletedUTXO.initFromTXInput(input));
                    }
                }
                for (const [index, output] of transaction.output.entries()) {
                    mempool.addAddedUTXOToMempool(output.recipientAddress, `${transaction.txid}_${index}`, AddedUTXO.initFromTXOutput(output));
                }
            }
    
            cli.leicoin_net_message.server.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);
        } else {
            cli.leicoin_net_message.server.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
        }

        return {cb: true, validationresult: validationresult };
    }

    //cli.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);
	return { cb: false, validationresult: null };

}
