const express = require('express');
const router = express.Router();

const validation = require('../../../validation');

const data = require("../../../handlers/dataHandler");

// Route for receiving new transactions
router.use('/', (req, res, next) => {

	if (req.method !== 'POST') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use POST instead' });
        return;
    }

	const transactionData = req.body;
	
	// Validate the transaction (add your validation logic here)
	const validationresult = validation.isValidTransaction(transactionData)

	res.status(validationresult.status)
	res.json({message: validationresult.message});

	if (!validationresult.cb) {
		return;
	}

	// Add the transaction to the mempool (replace with your blockchain logic)
	data.addTransactionToMempool(transactionData);
	return;
});

// Replace this function with your actual transaction validation logic

module.exports = router;