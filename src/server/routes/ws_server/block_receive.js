const { writeBlock, updateLatestBlockInfo, clearMempool, addUTXOS, deleteUTXOS} = require('../../../handlers/dataHandler');
const util = require('../../../utils');
const validation = require('../../../validation');

module.exports = function (block) {
    if (validation.isValidBlock(block).cb) {

		writeBlock(block);
		updateLatestBlockInfo(block.index, block.hash);
		clearMempool(block);

		addUTXOS({txid: block.hash, index: 0, recipientAddress: block.coinbase.minerAddress, amount: block.coinbase.amount}, true);

		for (const [, transactionData] of Object.entries(block.transactions)) {
			deleteUTXOS(transactionData);
			addUTXOS(transactionData, false);
		}

		util.ws_client_message.success(`Received block with hash ${block.hash} has been validated. Adding to Blockchain.`);
	} else {
		util.ws_client_message.error(`Received block with hash ${block.hash} is invalid.`);
	}
}
