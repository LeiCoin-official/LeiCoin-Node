import config from "../handlers/configHandler.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackage } from "../objects/leicoinnet.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import cli from "../utils/cli.js";
import utils from "../utils/utils.js";
import Validation from "../validation.js";
import stakerpool from "./stakepool.js";

export class Staking {

	private static instance: Staking;

	public static getInstance() {
		if (!Staking.instance) {
			Staking.instance = new Staking();
		}
		return Staking.instance;
	}

	public initIfActive() {
		if (config.staker.active) {
			if (Validation.validateAddress(config.staker.address)) {
				cli.staker_message.log("Staker started");
			} else {
				cli.staker_message.error("Staker could not be started: Invalid Address.");
			}
		}
	}

	public async runNextStaking(hash: string) {

		const nextStaker = stakerpool.getNextStaker(hash);

		if (nextStaker.address === config.staker.address) {

			const block = Block.createNewBlock();

			// Adjust the delay maybe later for faster Block times
			//await new Promise((resolve) => setTimeout(resolve, 10_000));

			await this.broadcastBlock(block);

			this.runNextStaking(block.hash);

		}
		
	}

	private async broadcastBlock(block: Block) {
		if (Validation.isValidBlock(block).cb) {

			blockchain.blocks.addBlock(block);
			blockchain.chainstate.updateLatestBlockInfo(block, "main");
			mempool.clearMempoolbyBlock(block);

			await blockchain.wallets.adjustWalletsByBlock(block);

			utils.events.emit("block_receive", LeiCoinNetDataPackage.create("block", block));

			cli.staker_message.success(`Created block with hash ${block.hash} has been validated. Broadcasting now.`);
		} else {
			cli.staker_message.log(`Created block with hash ${block.hash} is invalid.`);
		}
	}


}

const staking = Staking.getInstance();
export default staking;
