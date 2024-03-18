import Block from "../objects/block.js";
import { LeiCoinNetDataPackage } from "../objects/leicoinnet.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import cli from "../utils/cli.js";
import utils from "../utils/utils.js";
import Validation from "../validation.js";


class ValidatorJob {

	private static instance: ValidatorJob;

	public static getInstance() {
		if (!ValidatorJob.instance) {
            ValidatorJob.instance = new ValidatorJob();
        }
        return ValidatorJob.instance;
	}

}

class ProposerJob {

	private static instance: ProposerJob;

	public static getInstance() {
		if (!ProposerJob.instance) {
            ProposerJob.instance = new ProposerJob();
        }
        return ProposerJob.instance;
	}

    public block: Block | null = null;

    public create() {

		this.block = Block.createNewBlock();

        // Adjust the delay maybe later for faster Block times
        //await new Promise((resolve) => setTimeout(resolve, 10_000));

    }

    public sendToCommittee() {
        


    }

    public async broadcastBlock() {

		if (!this.block || !Validation.isValidBlock(this.block).cb) {
			cli.staker_message.log(`Created block with hash ${this.block?.hash} is invalid.`);
			return;
		}

		blockchain.blocks.addBlock(this.block);
		blockchain.chainstate.updateLatestBlockInfo(this.block, "main");
		mempool.clearMempoolbyBlock(this.block);

		await blockchain.wallets.adjustWalletsByBlock(this.block);

		utils.events.emit("block_receive", LeiCoinNetDataPackage.create("block", this.block));

		cli.staker_message.success(`Created block with hash ${this.block.hash} has been validated. Broadcasting now.`);
		return;
		
	}

}

export const validatorJob = ValidatorJob.getInstance();
export const proposerJob = ProposerJob.getInstance();
