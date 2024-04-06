import CryptoHandlers from "../handlers/cryptoHandlers.js";
import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import { AttestationSendData } from "../objects/attestation.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import Proposition from "../objects/proposition.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import cli from "../utils/cli.js";
import utils from "../utils/index.js";
import Verification from "../verification/index.js";
import validatorsCommittee from "./committee.js";
import validator from "./index.js";

export class AttesterJob {

	public static async createAttestation(block: Block) {

		const vote = (await Verification.verifyBlock(block)).cb;
		const nonce = validatorsCommittee.getMember(validator.publicKey).nonce;
		const attestation = new AttestationSendData(validator.publicKey, block.hash, vote, nonce, "");
		attestation.signature = await CryptoHandlers.sign(attestation.calculateHash(), validator.privateKey);
		return attestation;
		
	}

	public static async processProposition(proposition: Proposition) {

		validatorsCommittee.setCurrentBlock(proposition.block);

		if (validatorsCommittee.isCurrentAttestor(validator.publicKey)) {
			const attestation = await this.createAttestation(proposition.block);
			ValidatorPipeline.broadcast(LeiCoinNetDataPackageType.V_VOTE, attestation.encodeToHex(), attestation.publicKey);
		}

	}

}

export class ProposerJob {

    public static async createProposition() {
		
		const block = Block.createNewBlock(validator.publicKey);
		const nonce = validatorsCommittee.getMember(validator.publicKey).nonce;
		const proposition = new Proposition(validator.publicKey, nonce, "", block);
		proposition.signature = await CryptoHandlers.sign(proposition.calculateHash(), validator.privateKey);
		return proposition;

        // Adjust the delay maybe later for faster Block times
        // await new Promise((resolve) => setTimeout(resolve, 15_000));
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

	public static async processAttestation(attestation: AttestationSendData) {

		if (validatorsCommittee.isCurrentProposer(validator.publicKey)) {
            
			validatorsCommittee.getCurrentBlock()?.addAttestation(attestation.toAttestationInBlock());
            
		}

    }

}

