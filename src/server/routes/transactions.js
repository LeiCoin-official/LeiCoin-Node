const express = require('express');
const router = express.Router();

const validation = require('../../validation');

const data = require("../../handlers/dataHandler");

// Route for receiving new transactions
router.post('/', (req, res) => {
	const transactionData = req.body;
	
	// Validate the transaction (add your validation logic here)
	const validationresult = validation.isValidTransaction(transactionData)

	if (!validationresult.cb) {
		res.status(validationresult.status)
		res.json({message: validationresult.message});
		return;
	}

	// Add the transaction to the mempool (replace with your blockchain logic)
	data.addTransactionToMempool(transactionData);

	res.json({ message: validationresult.message });

});

// Replace this function with your actual transaction validation logic

module.exports = router;