import Verification from "@/verification/index.js";
import { Blockchain } from "@/storage/blockchain.js";
import mempool from "@/storage/mempool.js";
import Elysia from "elysia";
import { type Block } from "@/objects/block.js";
import { VCodes } from "@/verification/codes.js";
import { HTTPRouter405Route } from "../route.js";

let router = new Elysia({prefix: '/sendBlocks'})

.use(HTTPRouter405Route())

// Route for receiving new transactions
.post('/', async ({set, body}) => {
    const blockData = body as Block;
	
	// Validate the transaction (add your validation logic here)
	const validationresult = await Verification.verifyBlock(blockData);

    set.status = validationresult.status;

	if (validationresult.status !== 12000) {
		return Response.json({ code: validationresult.status, message: VCodes[validationresult.status] });
	}

    // Add the transaction to the mempool (replace with your blockchain logic)
    Blockchain.blocks.add(blockData);
    //Blockchain.updateLatestBlockInfo(blockData.index, blockData.hash);
    mempool.clearMempoolbyBlock(blockData);

    return Response.json({ code: validationresult.status, message: 'Block added to the blockchain' });
});

const sendBlocks_route = router;
export default sendBlocks_route;