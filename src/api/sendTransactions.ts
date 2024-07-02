import express from "express";
const router = express.Router();
import Verification from "../verification/index.js";
import utils from "../utils/index.js";
import mempool from "../storage/mempool.js";
import { CB } from "../utils/callbacks.js";
import { LeiCoinNetDataPackage } from "../objects/leicoinnet.js";
import { VCodes } from "../verification/codes.js";

// Route for receiving new transactions
router.use('/', async (req, res, next) => {

	if (req.method !== 'POST') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use POST instead' });
        return;
    }

	const transactionData = req.body;

	// Validate the transaction (add your validation logic here)
	const validationresult = await Verification.verifyTransaction(transactionData);

	//res.status(validationresult.status);
	res.status(400);
	res.json({message: VCodes[validationresult]});

	if (validationresult !== 12000) {
		return;
	}

	// Add the transaction to the mempool (replace with your blockchain logic)
	mempool.addTransactionToMempool(transactionData);

	

	return;
});

const sendTransactions_route = router;
export default sendTransactions_route;