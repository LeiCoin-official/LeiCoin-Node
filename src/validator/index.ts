import { PrivateKey, PublicKey } from "../crypto/cryptoKeys.js";
import config from "../handlers/configHandler.js";
import ValidatorPipeline from "../leicoin-net/pipelines/validators.js";
import { AddressHex } from "../objects/address.js";
import { LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import { PX } from "../objects/prefix.js";
import Staker from "../objects/staker.js";
import cli from "../cli/cli.js";
import Constants from "../utils/constants.js";
import { DataUtils } from "../utils/dataUtils.js";
import utils from "../utils/index.js";
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
	public readonly stakers: Staker[] = [];

	public isInCurrentCommittee = false;

	private constructor() {
		this.active = config.staker.active;
		for (const staker of config.staker.stakers) {
			this.stakers.push(new Staker(
				PrivateKey.from(staker.privateKey),
				AddressHex.from(staker.address)
			));
		}
	}

	public initIfActive() {

		if (this.active) {

			for (const staker of this.stakers) {
				if (!Verification.verifyAddress(staker.address, PX.A_0e)) {
					cli.staker_message.error("Staker could not be started: Invalid Address.");
					utils.gracefulShutdown(1);
				}
				if (AddressHex.fromPrivateKey(PX.A_0e, staker.privateKey).eqn(staker.address)) {
					cli.staker_message.error("Staker could not be started: Invalid PrivateKey - Address Pair.");
					utils.gracefulShutdown(1);
				}
			}

			cli.staker_message.info("Staker started");

		}

	}

}

const validator = Validator.getInstance();
export default validator;
