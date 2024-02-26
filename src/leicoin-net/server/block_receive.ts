import blockchain from "../../handlers/storage/blockchain.js";
import mempool from "../../handlers/storage/mempool.js";
import Block from "../../objects/block.js";
import cli from "../../utils/cli.js";
import utils from "../../utils/utils.js";
import validation from "../../validation.js";

export default function (data: any) {

	const block = utils.createInstanceFromJSON(Block, data);

	if (!blockchain.simpleCheckBlockExisting(block.index, block.hash)) {

		const validationresult = validation.isValidBlock(block);

		if (validationresult.cb) {

			blockchain.addBlock(block);
			blockchain.updateLatestBlockInfo(
				validationresult.forkchain,
				block
			);
			mempool.clearMempoolbyBlock(block);
	
			blockchain.addUTXOS({txid: block.hash, index: 0, recipientAddress: block.coinbase.minerAddress, amount: block.coinbase.amount}, true);
	
			for (const [, transactionData] of Object.entries(block.transactions)) {
				blockchain.deleteUTXOS(transactionData);
				blockchain.addUTXOS(transactionData, false);
			}
	
			cli.leicoin_net_message.server.success(`Received block with hash ${block.hash} has been validated. Adding to Blockchain.`);
		} else {
			cli.leicoin_net_message.server.error(`Received block with hash ${block.hash} is invalid. Error: ${JSON.stringify(validationresult)}`);
		}

		return validationresult;
	}

	return {cb: false};

}
