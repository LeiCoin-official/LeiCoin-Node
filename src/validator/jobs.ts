import Crypto from "../crypto/index.js";
import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import { AddressHex } from "../objects/address.js";
import Attestation from "../objects/attestation.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import { PX } from "../objects/prefix.js";
import Proposition from "../objects/proposition.js";
import Signature from "../objects/signature.js";
import Staker from "../objects/staker.js";
import POS from "../pos/index.js";
import { Uint64 } from "../utils/binary.js";
import Verification from "../verification/index.js";
import validator from "./index.js";

export class AttesterJob {

	private static async createAttestation(block: Block, staker: Staker) {

		const vote = (await Verification.verifyBlock(block)).status === 12000;
		const attestation = new Attestation(
			staker.address,
			block.slotIndex,
			block.hash,
			vote,
			Uint64.from(0),
			Signature.empty()
		);
		attestation.signature = Crypto.sign(attestation.calculateHash(), PX.A_0e, staker.privateKey);
		return attestation;
		
	}

	public static async attest(proposition: Proposition, staker: Staker) {
		const attestation = await this.createAttestation(proposition.block, staker);
		ValidatorPipeline.broadcast(
			LeiCoinNetDataPackageType.V_VOTE,
			attestation.encodeToHex(),
			attestation.attester
		);
	}

}

export class ProposerJob {

	private static async createProposition(staker: Staker) {
		const currentSlotIndex = POS.getCurrentSlot().index;
		const block = Block.createNewBlock(currentSlotIndex, staker);
		const proposition = new Proposition(
			staker.address,
			currentSlotIndex,
			Uint64.from(0),
			Signature.empty(),
			block
		);
		proposition.signature = Crypto.sign(proposition.calculateHash(), PX.A_0e, staker.privateKey);
		return proposition;
	}

    public static async propose(staker: Staker) {
		const proposition = await this.createProposition(staker);
		ValidatorPipeline.broadcast(
			LeiCoinNetDataPackageType.V_PROPOSE,
			proposition.encodeToHex(),
			proposition.proposer
		);

        // Adjust the delay maybe later for faster Block times
        // await new Promise((resolve) => setTimeout(resolve, 15_000));
    }

    /*public static async broadcastBlock(block: Block) {

		if (!block || !(await Verification.verifyBlock(block)).cb) {
			cli.staker_message.info(`Created block with hash ${block?.hash} is invalid.`);
			return;
		}

		blockchain.blocks.addBlock(block);
		blockchain.chainstate.updateLatestBlockInfo(block, "main");
		mempool.clearMempoolbyBlock(block);

		await blockchain.wallets.adjustWalletsByBlock(block);

		utils.events.emit("block_receive", LeiCoinNetDataPackage.create(block));

		cli.staker_message.success(`Created block with hash ${block.hash} has been validated. Broadcasting now.`);
		return;
		
	}*/

}

