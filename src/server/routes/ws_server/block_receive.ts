import { writeBlock, updateLatestBlockInfo, clearMempool, addUTXOS, deleteUTXOS, existsBlock } from "../../../handlers/dataHandler.js";
import utils from "../../../utils.js";
import validation from "../../../validation.js";

export default function (block) {
	const blocksExist = existsBlock(block.hash, block.index);
	if (blocksExist.cb === "success" && !blocksExist.exists && !blocksExist.fork) {

		const validationresult = validation.isValidBlock(block);

		if (validationresult.cb) {

			writeBlock(block);
			updateLatestBlockInfo(
				validationresult.forkchain,
				{hash: block.previousHash, index: block.index -1 },
				{hash: block.hash, index: block.index}
			);
			clearMempool(block);
	
			addUTXOS({txid: block.hash, index: 0, recipientAddress: block.coinbase.minerAddress, amount: block.coinbase.amount}, true);
	
			for (const [, transactionData] of Object.entries(block.transactions)) {
				deleteUTXOS(transactionData);
				addUTXOS(transactionData, false);
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
