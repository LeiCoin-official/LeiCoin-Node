import config from "../handlers/configHandler.js";
import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import { LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import cli from "../utils/cli.js";
import Constants from "../utils/constants.js";
import utils from "../utils/index.js";
import Verification from "../verification/index.js";
import validatorsCommittee from "./committee.js";
import { ProposerJob } from "./job.js";

class Validator {

	private static instance: Validator;

	public static getInstance() {

		if (!Validator.instance) {
			Validator.instance = new Validator();
		}

		return Validator.instance;
		
	}

	public readonly active: boolean;
	public readonly publicKey: string;
	public readonly privateKey: string;
	public readonly address: string;

	public isInCurrentCommittee = false;

	private constructor() {
		this.active = config.staker.active;
		this.publicKey = config.staker.publicKey;
		this.privateKey = config.staker.privateKey;
		this.address = config.staker.address;
	}

	public initIfActive() {

		if (this.active) {
			if (Verification.verifyAddress(this.address)) {
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

		const { currentEpoch, relativeSlot } = utils.calculateEpochAndRelativeSlot(lastSlot);

		if (relativeSlot === Constants.LAST_EPOCH_SLOT) {
			await this.startNextEpoch(lastBlockHash);
		}

		const nextProposer = validatorsCommittee.calculateNextProposer(lastBlockHash);

		if (validatorsCommittee.isMember(this.publicKey)) {

			this.isInCurrentCommittee = true;

			if (nextProposer === this.publicKey) {

				const proposition = await ProposerJob.createProposition();
				ValidatorPipeline.broadcast(LeiCoinNetDataPackageType.V_PROPOSE, proposition.encodeToHex(), this.publicKey);
				
			} else {

				

			}

		}
			
	}

	public async startNextEpoch(lastBlockHash: string) {
		return validatorsCommittee.createNewCommittee(lastBlockHash);
	}

}

const validator = Validator.getInstance();
export default validator;
