import Verification from "@/verification/index.js";
import mempool from "@/storage/mempool.js";
import { VCodes } from "@/verification/codes.js";
import Elysia from "elysia";
import { type Transaction } from "@/objects/transaction.js";
import { HTTPRouter405Route } from "../route.js";

let router = new Elysia({prefix: '/sendTransactions'})

.use(HTTPRouter405Route())

// Route for receiving new transactions
.post('/', async({set, body}) => {
	const transactionData = body as Transaction;

	// Validate the transaction (add your validation logic here)
	const validationresult = await Verification.verifyTransaction(transactionData);

	if (validationresult !== 12000) {
		set.status = 400;
		return Response.json({message: VCodes[validationresult]});
	}

	// Add the transaction to the mempool (replace with your blockchain logic)
	mempool.addTransactionToMempool(transactionData);

	return Response.json({code: validationresult, message: 'Transaction added to the mempool'});
});

const sendTransactions_route = router;
export default sendTransactions_route;