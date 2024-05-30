import Crypto from "../crypto/index.js";
import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import { AddressHex } from "../objects/address.js";
import Attestation from "../objects/attestation.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import { PX } from "../objects/prefix.js";
import Proposition from "../objects/proposition.js";
import Signature from "../objects/signature.js";
import VCommittee from "../pos/committee.js";
import POS from "../pos/index.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import { Uint64 } from "../utils/binary.js";
import cli from "../utils/cli.js";
import utils from "../utils/index.js";
import Verification from "../verification/index.js";
import validator from "./index.js";

export class AttesterJob {

	private static async createAttestation(block: Block) {

		const vote = (await Verification.verifyBlock(block)).cb;
		const attestation = new Attestation(
			validator.address,
			block.slotIndex,
			block.hash,
			vote,
			Uint64.from(0),
			Signature.empty()
		);
		attestation.signature = Crypto.sign(attestation.calculateHash(), PX.A_0e, validator.privateKey);
		return attestation;
		
	}

	public static async attest(proposition: Proposition) {
		const attestation = await this.createAttestation(proposition.block);
		ValidatorPipeline.broadcast(
			LeiCoinNetDataPackageType.V_VOTE,
			attestation.encodeToHex(),
			attestation.attester
		);
	}

}

export class ProposerJob {

	private static async createProposition() {
		const block = Block.createNewBlock();
		const proposition = new Proposition(
			validator.address,
			POS.getCurrentSlot().index,
			Uint64.from(0),
			Signature.empty(),
			block
		);
		proposition.signature = Crypto.sign(proposition.calculateHash(), PX.A_0e, validator.privateKey);
		return proposition;
	}

    public static async propose() {
		const proposition = await this.createProposition();
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

