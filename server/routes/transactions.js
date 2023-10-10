const express = require('express');
const router = express.Router();

const validation = require('../validation');

const data = require("../data-handler");

// Route for receiving new transactions
router.post('/', (req, res) => {
	const transactionData = req.body;

	// Validate the transaction (add your validation logic here)
	if (!validation.isValidTransaction(transactionData)) {
		res.status(400).json({ error: 'Invalid transaction data' });
		return;
	}

	// Add the transaction to the mempool (replace with your blockchain logic)
	data.addTransactionToMempool(transactionData);

	res.json({ message: 'Transaction received and added to the mempool.' });

});

// Replace this function with your actual transaction validation logic

module.exports = router;