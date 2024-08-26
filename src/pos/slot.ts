import { AddressHex } from "../objects/address.js";
import { type Block } from "../objects/block.js";
import { type Uint64 } from "../binary/uint.js";
import { type MinterClient } from "../minter/index.js";
import Verification, { BlockValidationResult } from "../verification/index.js";
import { Execution } from "./execution.js";
import { Blockchain } from "../storage/blockchain.js";
import cli from "../cli/cli.js";
import Schedule from "../utils/schedule.js";

export class Slot {

    protected slot_started = false;

    public block: Block | null = null;
    public block_verification: Promise<BlockValidationResult> | null = null;
    protected readonly blockTimeout: Schedule;

    protected constructor(
        readonly index: Uint64,
        readonly minter: AddressHex,
    ) {
        this.blockTimeout = new Schedule(async() => await this.onBlockNotMinted(), 5000);
        this.onSlotStart();
    }

    public static async create(index: Uint64) {
        const nextMinter = await Blockchain.minters.selectNextMinter(index);
        cli.minter.info(`Slot ${index.toBigInt()} minter: ${nextMinter.toHex()}`);
        return new Slot(index, nextMinter);
    }

    protected async onSlotStart() {
        if (this.slot_started) return;
        this.slot_started = true;

        for (const mc of this.minterClients) {
            if (this.isMinter(mc.credentials.address)) {
                await mc.mint(this);
                break;
            }
        }
    }

    protected async onBlockNotMinted() {
        if (this.blockTimeout.hasFinished()) return;
        this.blockTimeout.cancel();
        cli.leicoin_net.info(`Minter ${this.minter.toHex()} did not mint a block on Slot ${this.index.toBigInt()}`);
    }


    public async processBlock(block: Block) {
        if (this.blockTimeout.hasFinished()) return;
        this.blockTimeout.cancel();

        if (this.block) return;
        this.block = block;

        this.block_verification = Verification.verifyBlock(block);
        const verification_result = await this.block_verification;
        await Execution.executeBlock(block, verification_result)
    }

    public isMinter(address: AddressHex) {
        return this.minter.eq(address);
    }

}

export default Slot;
