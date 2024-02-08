import express from "express";
import validation from "../../../validation.js";
import dataHandler from "../../../handlers/dataHandler.js";

const router = express.Router();

// Route for receiving new transactions
router.use('/', (req, res, next) => {

    if (req.method !== 'POST') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use POST instead' });
        return;
    }

	const blockData = req.body;
	
	// Validate the transaction (add your validation logic here)
	const validationresult = validation.isValidBlock(blockData);

    res.status(validationresult.status);
	res.json({ message: validationresult.message });

	if (!validationresult.cb) {
		return;
	}

    // Add the transaction to the mempool (replace with your blockchain logic)
    writeBlock(blockData);
    updateLatestBlockInfo(blockData.index, blockData.hash);
    clearMempool();

});

const sendBlocks_route = router;
export default sendBlocks_route;