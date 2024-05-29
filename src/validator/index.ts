import { PrivateKey, PublicKey } from "../crypto/cryptoKeys.js";
import config from "../handlers/configHandler.js";
import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import { AddressHex } from "../objects/address.js";
import { LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import cli from "../utils/cli.js";
import Constants from "../utils/constants.js";
import { DataUtils } from "../utils/dataUtils.js";
import Verification from "../verification/index.js";
import { ProposerJob } from "./jobs.js";

class Validator {

	private static instance: Validator;

	public static getInstance() {

		if (!Validator.instance) {
			Validator.instance = new Validator();
		}

		return Validator.instance;
		
	}

	public readonly active: boolean;
	public readonly privateKey: PrivateKey;
	public readonly address: AddressHex;

	public isInCurrentCommittee = false;

	private constructor() {
		this.active = config.staker.active;
		this.privateKey = PrivateKey.from(config.staker.privateKey);
		this.address = AddressHex.from(config.staker.address);
	}

	public initIfActive() {

		if (this.active) {
			if (Verification.verifyAddress(config.staker.address)) {
				cli.staker_message.info("Staker started");
			} else {
				cli.staker_message.error("Staker could not be started: Invalid Address.");
			}
		}

	}

	public async startNextSlot(lastSlot: string, lastBlockHash: string) {

		/*const nextStaker = stakerpool.getNextStaker(hash);

		if (nextStaker.address === config.staker.address) {

			const block = Block.createNewBlock();

			// Adjust the delay maybe later for faster Block times
			//await new Promise((resolve) => setTimeout(resolve, 10_000));

			await this.broadcastBlock(block);

			this.runNextStaking(block.hash);

		}*/

		if (.isMember(this.publicKey)) {

			if (nextProposer === this.publicKey) {

				const proposition = await ProposerJob.createProposition();
				ValidatorPipeline.broadcast(LeiCoinNetDataPackageType.V_PROPOSE, proposition.encodeToHex(), this.publicKey);
				
			} else {

				

			}

		}
			
	}

}

const validator = Validator.getInstance();
export default validator;
