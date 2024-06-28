import Crypto from "../crypto/index.js";
import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import Attestation from "../objects/attestation.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import { PX } from "../objects/prefix.js";
import Proposition from "../objects/proposition.js";
import Signature from "../objects/signature.js";
import Staker from "../objects/staker.js";
import POS from "../pos/index.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import { Uint256, Uint64 } from "../utils/binary.js";
import Verification from "../verification/index.js";

export class AttesterJob {

	private static async createAttestation(blockHash: Uint256, vote: boolean, staker: Staker) {
		const attestation = new Attestation(
			staker.address,
			POS.getCurrentSlot().index,
			blockHash,
			vote,
			Signature.empty()
		);
		attestation.signature = Crypto.sign(attestation.calculateHash(), PX.A_0e, staker.privateKey);
		return attestation;
	}

	public static async attest(proposition: Proposition | null, staker: Staker) {
		
		const attestation = await this.createAttestation(
			proposition?.block.hash || Uint256.alloc(),
			proposition ? ((await Verification.verifyBlock(proposition.block)).status === 12000) : false,
			staker
		);

		ValidatorPipeline.broadcast(
			LeiCoinNetDataPackageType.V_VOTE,
			attestation.encodeToHex()
		);

		POS.getCurrentSlot().processAttestation(attestation);
	}

}

export class ProposerJob {

	private static async createProposition(staker: Staker) {
		const currentSlotIndex = POS.getCurrentSlot().index;
		
		const previousBlock = blockchain.chainstate.getLatestBlockInfo();
		const block = new Block(
			previousBlock?.index.add(1) || Uint64.from(0),
			currentSlotIndex,
			Uint256.alloc(),
			previousBlock?.hash || Uint256.alloc(),
			Uint64.from(new Date().getTime()),
			staker.address,
			POS.watingAttestations,
			POS.watingProposerSlashings,
			POS.watingAttesterSlashings,
			Object.values(mempool.transactions)
		)
		block.hash.set(block.calculateHash());

		const proposition = new Proposition(
			staker.address,
			currentSlotIndex,
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
			proposition.encodeToHex()
		);

		POS.getCurrentSlot().processProposition(proposition);

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

