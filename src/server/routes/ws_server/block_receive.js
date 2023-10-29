const { writeBlock, updateLatestBlockInfo, clearMempool, addUTXOS, deleteUTXOS, existsBlock } = require('../../../handlers/dataHandler');
const util = require('../../../utils');
const validation = require('../../../validation');

module.exports = function (block) {
	const blocksExist = existsBlock(block.hash, block.index);
	if (blocksExist.cb === "success" && !blocksExist.exists && !block.fork) {

		const validationresult = validation.isValidBlock(block);

		if (validationresult.cb) {

			writeBlock(block);
			updateLatestBlockInfo(block.index, block.hash);
			clearMempool(block);
	
			addUTXOS({txid: block.hash, index: 0, recipientAddress: block.coinbase.minerAddress, amount: block.coinbase.amount}, true);
	
			for (const [, transactionData] of Object.entries(block.transactions)) {
				deleteUTXOS(transactionData);
				addUTXOS(transactionData, false);
			}
	
			util.server_message.success(`Received block with hash ${block.hash} has been validated. Adding to Blockchain.`);
		} else {
			util.server_message.error(`Received block with hash ${block.hash} is invalid. Error: ${JSON.stringify(validationresult)}`);
		}

		return { cb: true, validationresult: validationresult };
	}

	//util.ws_client_message.error(`Received block with hash ${block.hash} is invalid.`);
	return { cb: false, validationresult: null} ;
}
