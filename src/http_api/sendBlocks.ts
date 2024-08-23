import express from "express";
import Verification from "../verification/index.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import { VCodes } from "../verification/codes.js";

const router = express.Router();

// Route for receiving new transactions
router.use('/', async (req, res, next) => {

    if (req.method !== 'POST') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use POST instead' });
        return;
    }

	const blockData = req.body;
	
	// Validate the transaction (add your validation logic here)
	const validationresult = await Verification.verifyBlock(blockData);

    res.status(validationresult.status);
	res.json({ message: VCodes[validationresult.status] });

	if (validationresult.status !== 12000) {
		return;
	}

    // Add the transaction to the mempool (replace with your blockchain logic)
    blockchain.blocks.addBlock(blockData);
    //blockchain.updateLatestBlockInfo(blockData.index, blockData.hash);
    mempool.clearMempoolbyBlock(blockData);

});

const sendBlocks_route = router;
export default sendBlocks_route;