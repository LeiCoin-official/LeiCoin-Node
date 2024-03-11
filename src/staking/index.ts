import config from "../handlers/configHandler.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackage } from "../objects/leicoinnet.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import cli from "../utils/cli.js";
import utils from "../utils/utils.js";
import Validation from "../validation.js";

export class Staking {

	private static instance: Staking;

	public static getInstance() {
		if (!Staking.instance) {
			Staking.instance = new Staking();
		}
		return Staking.instance;
	}

	public initStakerIfActive() {
		if (config.staker.active) {
			if (Validation.validateAddress(config.staker.address)) {
				cli.staker_message.log("Staker started");
			} else {
				cli.staker_message.error("Staker could not be started: Invalid Address.")
			}
		}
	}

	private constructor() {

	}

	public async runNextStaking() {

		const blockResult = await runInMiningParallel();
	
		if (blockResult !== null) {
			afterMiningLogic(blockResult);
		}
	
		// Adjust the delay maybe later for faster Block times
		await new Promise((resolve) => setTimeout(resolve, 1000));
		
	}

	private async broadcastBlock(blockResult: Block) {
		if (Validation.isValidBlock(blockResult).cb) {

			blockchain.blocks.addBlock(blockResult);
			blockchain.chainstate.updateLatestBlockInfo(blockResult, "main");
			mempool.clearMempoolbyBlock(blockResult);

			await blockchain.wallets.adjustWalletsByBlock(blockResult);

			utils.events.emit("block_receive", LeiCoinNetDataPackage.create("block", blockResult));

			cli.staker_message.success(`Mined block with hash ${blockResult.hash} has been validated. Broadcasting now.`);
		} else {
			cli.staker_message.log(`Mined block with hash ${blockResult.hash} is invalid.`);
		}
	}


}

const staking = Staking.getInstance();

export default staking;