import express from "express";
import getUTXOS_router from "./getUTXOS.js";
import sendTransactions_router from "./sendTransactions.js";

const router = express.Router();

// Route for api
router.use('/', (ws, res, next) => {

    res.status(200);
	res.json({ message: "Online" });

});

router.use('/sendtransactions', sendTransactions_router);
router.use('/getutxos', getUTXOS_router);
//router.use('/sendblocks', require('./sendBlocks'));

const api_router = router;
export default api_router;