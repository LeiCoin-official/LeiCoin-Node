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

}

const validator = Validator.getInstance();
export default validator;
