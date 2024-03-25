import CryptoHandlers from "../handlers/cryptoHandlers.js";
import { AttestationSendData } from "../objects/attestation.js";
import Block from "../objects/block.js";
import { LeiCoinNetDataPackage } from "../objects/leicoinnet.js";
import Proposition from "../objects/proposition.js";
import Transaction from "../objects/transaction.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import BigNum from "../utils/bigNum.js";
import cli from "../utils/cli.js";
import utils from "../utils/index.js";
import Verification from "../verification/index.js";
import validatorsCommittee from "./committee.js";
import validator from "./index.js";


export class AttesterJob {

	public static async create(block: Block) {
		const vote = (await Verification.verifyBlock(block)).cb;
		const nonce = validatorsCommittee.getMember(validator.publicKey).nonce;
		const attestation = new AttestationSendData(validator.publicKey, block.hash, vote, nonce, "");
		attestation.signature = CryptoHandlers.sign(attestation.calculateHash(), validator.privateKey);
	}

	public static sendToCommittee(attestation: AttestationSendData) {



	}

}

export class ProposerJob {

    public static create() {
		
		const block = Block.createNewBlock(validator.publicKey);
		const nonce = validatorsCommittee.getMember(validator.publicKey).nonce;
		const proposition = new Proposition(validator.publicKey, nonce, "", block)

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

