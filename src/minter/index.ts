import { PrivateKey } from "../crypto/cryptoKeys.js";
import { AddressHex } from "../objects/address.js";
import { PX } from "../objects/prefix.js";
import cli from "../cli/cli.js";
import Verification from "../verification/index.js";
import { Uint256, Uint64 } from "../binary/uint.js";
import { Blockchain } from "../storage/blockchain.js";
import Block from "../objects/block.js";
import mempool from "../storage/mempool.js";
import Signature from "../objects/signature.js";
import LCrypt from "../crypto/index.js";
import { MinterCredentials } from "../objects/minter.js";
import { type Slot } from "../pos/slot.js";
import { LeiCoinNetDataPackage, LNPPX } from "../leicoin-net/packages.js";
import { LeiCoinNetNode } from "../leicoin-net/index.js";

export class MinterClient {

	private constructor(
		public readonly credentials: MinterCredentials,
	) {}

	public verifyCredentials(): { cb: true } | { cb: false, message: string } {
		if (!Verification.verifyAddress(this.credentials.address, PX.A_0e)) {
			return { cb: false, message: "MinterClient could not be started: Invalid Address." };
		}
		if (AddressHex.fromPrivateKey(PX.A_0e, this.credentials.privateKey).eqn(this.credentials.address)) {
			return { cb: false, message: "MinterClient could not be started: Invalid PrivateKey - Address Pair." };
		}
		return { cb: true };
	}

	static createMinters(
		config: Array<{
			address: string,
			privateKey: string
		}>
	) {

		const clients: MinterClient[] = [];

		for (const staker of config) {
			const mc = new MinterClient(
				new MinterCredentials(
					PrivateKey.from(staker.privateKey),
					AddressHex.from(staker.address)
				),
			);

			const mc_verification = mc.verifyCredentials()

			if (mc_verification.cb) {
				clients.push(mc);
			} else {
				cli.minter.error(mc_verification.message);
			}
		}

		cli.minter.info("MinterClients started");

		return clients;
	}

	private async createNewBlock(currentSlotIndex: Uint64) {

		const previousBlock = Blockchain.chainstate.getLatestBlock();
		const block = new Block(
			previousBlock?.index.add(1) || Uint64.from(0),
			currentSlotIndex,
			Uint256.alloc(),
			previousBlock?.hash || Uint256.alloc(),
			Uint64.from(new Date().getTime()),
			this.credentials.address,
			Signature.empty(),
			mempool.transactions.values().all()
		)

		block.hash.set(block.calculateHash());
		block.signature = LCrypt.sign(block.calculateHash(), PX.A_0e, this.credentials.privateKey);
		return block;
	}

    async mint(currentSlot: Slot) {
		const block = await this.createNewBlock(currentSlot.index);

		LeiCoinNetNode.broadcast(
			LeiCoinNetDataPackage.create(
				LNPPX.BLOCK,
				block.encodeToHex()
			)
		);

		currentSlot.processBlock(block);
		
		cli.minter.success(`Created Block on Slot ${block.slotIndex.toBigInt()} with hash ${block.hash.toHex()}. Broadcasting now.`);
    }

}

export default MinterClient;