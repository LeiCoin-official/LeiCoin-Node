const express = require('express');
const router = express.Router();
const validation = require('../../../validation');
const { addTransactionToMempool, addDeletedUTXOToMempool, addAddedUTXOToMempool, removeAddedUTXOFromMempool } = require("../../../handlers/dataHandler");
const util = require('../../../utils').default;

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
	addTransactionToMempool(transactionData);

	for (const input of transactionData.input) {
		const removeAddedUTXOFromMempoolResult = removeAddedUTXOFromMempool(transactionData.senderAddress, `${input.txid}_${input.index}`);
		if (removeAddedUTXOFromMempoolResult.cb !== "success") {
			addDeletedUTXOToMempool(transactionData.senderAddress, `${input.txid}_${input.index}`);
		}
	}
	for (const output of transactionData.output) {
		addAddedUTXOToMempool(output.recipientAddress, `${transactionData.txid}_${output.index}`, output.amount);
	}

	util.events.emit("transaction_receive", JSON.stringify({type: "transaction", data: transactionData}));

	return;
});

// Replace this function with your actual transaction validation logic

module.exports = router;