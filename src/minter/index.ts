import { PrivateKey } from "../crypto/cryptoKeys.js";
import config from "../config/index.js";
import { AddressHex } from "../objects/address.js";
import { PX } from "../objects/prefix.js";
import cli from "../cli/cli.js";
import utils from "../utils/index.js";
import Verification from "../verification/index.js";
import { Uint256, Uint64 } from "../utils/binary.js";
import { LeiCoinNetDataPackageType } from "../objects/leicoinnet.js";
import blockchain from "../storage/blockchain.js";
import Block from "../objects/block.js";
import mempool from "../storage/mempool.js";
import Signature from "../objects/signature.js";
import Crypto from "../crypto/index.js";
import BlockPipeline from "../leicoin-net/pipelines/blocks.js";
import { MinterCredentials } from "../objects/minter.js";
import type Slot from "../pos/slot.js";

export class MinterClient {

	private static initialized = false;

	public static active = false;
	public static readonly minters: MinterCredentials[] = [];

	private static init() {
		if (this.initialized) return;
		this.initialized = true;

		for (const staker of config.staker.stakers) {
			this.minters.push(new MinterCredentials(
				PrivateKey.from(staker.privateKey),
				AddressHex.from(staker.address)
			));
		}

		for (const staker of this.minters) {
			if (!Verification.verifyAddress(staker.address, PX.A_0e)) {
				cli.minter.error("MinterClient could not be started: Invalid Address.");
				utils.gracefulShutdown(1);
			}
			if (AddressHex.fromPrivateKey(PX.A_0e, staker.privateKey).eqn(staker.address)) {
				cli.minter.error("MinterClient could not be started: Invalid PrivateKey - Address Pair.");
				utils.gracefulShutdown(1);
			}
		}

		cli.minter.info("MinterClient started");
	}

	public static initIfActive() {
		this.active = config.staker.active;
		if (this.active) this.init();
	}

	private static async createNewBlock(mc: MinterCredentials, currentSlotIndex: Uint64) {

		const previousBlock = blockchain.chainstate.getLatestBlock();
		const block = new Block(
			previousBlock?.index.add(1) || Uint64.from(0),
			currentSlotIndex,
			Uint256.alloc(),
			previousBlock?.hash || Uint256.alloc(),
			Uint64.from(new Date().getTime()),
			mc.address,
			Signature.empty(),
			Object.values(mempool.transactions)
		)

		block.hash.set(block.calculateHash());
		block.signature = Crypto.sign(block.calculateHash(), PX.A_0e, mc.privateKey);
		return block;
	}

    public static async mint(mc: MinterCredentials, currentSlot: Slot) {
		const block = await this.createNewBlock(mc, currentSlot.index);

		BlockPipeline.broadcast(
			LeiCoinNetDataPackageType.BLOCK,
			block.encodeToHex()
		);

		currentSlot.processBlock(block);
		
		cli.minter.success(`Created Block on Slot ${block.slotIndex.toInt()} with hash ${block.hash.toHex()}. Broadcasting now.`);
    }

}

export default MinterClient;