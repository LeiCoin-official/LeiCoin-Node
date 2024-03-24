import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import cli from "../utils/cli.js";
import utils from "../utils/index.js";
import Verification from "../verification/index.js";


export class AttesterJob {

	

}

export class ProposerJob {

    public static create() {
		return Block.createNewBlock();
        // Adjust the delay maybe later for faster Block times
        //await new Promise((resolve) => setTimeout(resolve, 10_000));
    }

    public static sendToCommittee(block: Block) {
        
		//ValidatorPipeline.broadcast(LeiCoinNetDataPackageType.VALIDATOR_PROPOSE, block.)

    }

    public static async broadcastBlock(block: Block) {

		if (!block || !(await Verification.verifyBlock(block)).cb) {
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

