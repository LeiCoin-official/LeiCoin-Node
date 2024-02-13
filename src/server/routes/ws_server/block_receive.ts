import blockchain from "../../../handlers/storage/blockchain.js";
import mempool from "../../../handlers/storage/mempool.js";
import Block from "../../../objects/block.js";
import utils from "../../../utils.js";
import { Callbacks } from "../../../utils/callbacks.js";
import validation from "../../../validation.js";

export default function (block: Block) {
	const blocksExist = blockchain.existsBlock(block.hash, block.index);
	if (blocksExist.cb === Callbacks.SUCCESS && !blocksExist.exists && !blocksExist.fork) {

		const validationresult = validation.isValidBlock(block);

		if (validationresult.cb) {

			blockchain.addBlock(block);
			blockchain.updateLatestBlockInfo(
				validationresult.forkchain,
				{hash: block.previousHash, index: block.index -1 },
				{hash: block.hash, index: block.index}
			);
			mempool.clearMempoolbyBlock(block);
	
			blockchain.addUTXOS({txid: block.hash, index: 0, recipientAddress: block.coinbase.minerAddress, amount: block.coinbase.amount}, true);
	
			for (const [, transactionData] of Object.entries(block.transactions)) {
				blockchain.deleteUTXOS(transactionData);
				blockchain.addUTXOS(transactionData, false);
			}
	
			utils.server_message.success(`Received block with hash ${block.hash} has been validated. Adding to Blockchain.`);
		} else {
			utils.server_message.error(`Received block with hash ${block.hash} is invalid. Error: ${JSON.stringify(validationresult)}`);
		}

		return { cb: true, validationresult: validationresult };
	}

	//utils.ws_client_message.error(`Received block with hash ${block.hash} is invalid.`);
	return { cb: false, validationresult: null} ;
}
