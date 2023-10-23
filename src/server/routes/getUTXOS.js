const express = require('express');
const router = express.Router();

const data = require("../../handlers/dataHandler");

// Route for receiving new transactions
router.use('/', (req, res, next) => {

    if (req.method !== 'GET') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use GET instead' });
        return;
    }

	const user = req.query;
	
	// Validate the transaction (add your validation logic here)
	const validationresult = validation.isValidBlock(blockData);

    res.status(validationresult.status);
	res.json({ message: validationresult.message });

	if (!validationresult.cb) {
		return;
	}

    // Add the transaction to the mempool (replace with your blockchain logic)
    data.writeBlock(blockData);
    data.updateLatestBlockInfo(blockData.index, blockData.hash);
    for (let [transactionHash, transactionData] of Object.entries(blockData.transactions)) {
    	data.removeTransactionFromMempool(transactionData);
  	}

});

// Replace this function with your actual transaction validation logic

module.exports = router;