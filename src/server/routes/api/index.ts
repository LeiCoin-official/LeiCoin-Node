import express from "express";
import getU
import sendTransactions from "./sendTransactions.js";

const router = express.Router();

// Route for api
router.use('/', (ws, res, next) => {

    res.status(200);
	res.json({ message: "Online" });

});

router.use('/sendtransactions', sendBlocks);
router.use('/getutxos', );
//router.use('/sendblocks', require('./sendBlocks'));

export default router;