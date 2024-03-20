import Block from "../objects/block.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import cli from "../utils/cli.js";
import utils from "../utils/index.js";
import Verification from "../verification.js";


class AttesterJob {

	private static instance: AttesterJob;

	public static getInstance() {
		if (!AttesterJob.instance) {
            AttesterJob.instance = new AttesterJob();
        }
        return AttesterJob.instance;
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

    public create() {
		return Block.createNewBlock();
        // Adjust the delay maybe later for faster Block times
        //await new Promise((resolve) => setTimeout(resolve, 10_000));
    }

    public sendToCommittee(block: Block) {
        


    }

    public async broadcastBlock(block: Block) {

		if (!block || !Verification.verifyBlock(block).cb) {
			cli.staker_message.log(`Created block with hash ${block?.hash} is invalid.`);
			return;
		}

		blockchain.blocks.addBlock(block);
		blockchain.chainstate.updateLatestBlockInfo(block, "main");
		mempool.clearMempoolbyBlock(block);

		await blockchain.wallets.adjustWalletsByBlock(block);

		utils.events.emit("block_receive", LeiCoinNetDataPackage.create(block));

		cli.staker_message.success(`Created block with hash ${block.hash} has been validated. Broadcasting now.`);
		return;
		
	}

}

export const attesterJob = AttesterJob.getInstance();
export const proposerJob = ProposerJob.getInstance();
