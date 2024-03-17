import config from "../handlers/configHandler.js";
import Block from "../objects/block.js";
import cli from "../utils/cli.js";
import Validation from "../validation.js";
import stakerpool from "./stakepool.js";

export class Validator {

	private static instance: Validator;

	public static getInstance() {

		if (!Validator.instance) {
			Validator.instance = new Validator();
		}

		return Validator.instance;
		
	}

	public initIfActive() {

		if (config.staker.active) {
			if (Validation.validateAddress(config.staker.address)) {
				cli.staker_message.log("Staker started");
			} else {
				cli.staker_message.error("Staker could not be started: Invalid Address.");
			}
		}

	}

	public async runNextStaking(hash: string) {

		const nextStaker = stakerpool.getNextStaker(hash);

		if (nextStaker.address === config.staker.address) {

			const block = Block.createNewBlock();

			// Adjust the delay maybe later for faster Block times
			//await new Promise((resolve) => setTimeout(resolve, 10_000));

			await this.broadcastBlock(block);

			this.runNextStaking(block.hash);

		}
		
	}

}

const staking = Validator.getInstance();
export default staking;
