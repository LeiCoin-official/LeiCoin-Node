import express from "express";
const router = express.Router();
import validation from "../validation.js";
import utils from "../utils.js";
import { AddedUTXO, DeletedUTXO } from "../objects/utxo.js";
import mempool from "../handlers/storage/mempool.js";
import { Callbacks } from "../utils/callbacks.js";

// Route for receiving new transactions
router.use('/', (req, res, next) => {

	if (req.method !== 'POST') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use POST instead' });
        return;
    }

	const transactionData = req.body;

	// Validate the transaction (add your validation logic here)
	const validationresult = validation.isValidTransaction(transactionData);

	res.status(validationresult.status)
	res.json({message: validationresult.message});

	if (!validationresult.cb) {
		return;
	}

	// Add the transaction to the mempool (replace with your blockchain logic)
	mempool.addTransactionToMempool(transactionData);

	for (const input of transactionData.input) {
		const removeAddedUTXOFromMempoolResult = mempool.removeAddedUTXOFromMempool(transactionData.senderAddress, input.utxoid);
		if (removeAddedUTXOFromMempoolResult.cb !== Callbacks.SUCCESS) {
			mempool.addDeletedUTXOToMempool(transactionData.senderAddress, input.utxoid, DeletedUTXO.initFromTXInput(input));
		}
	}
	for (const [index, output] of transactionData.output.entries()) {
		mempool.addAddedUTXOToMempool(output.recipientAddress, `${transactionData.txid}_${index}`, AddedUTXO.initFromTXOutput(output));
	}

	utils.events.emit("transaction_receive", transactionData);

	return;
});

const sendTransactions_route = router;
export default sendTransactions_route;