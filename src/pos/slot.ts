import { AddressHex } from "../objects/address.js";
import { type Block } from "../objects/block.js";
import { Uint64 } from "../utils/binary.js";
import MinterClient from "../minter/index.js";
import Verification, { BlockValidationResult } from "../verification/index.js";
import { Execution } from "./execution.js";
import blockchain from "../storage/blockchain.js";
import cli from "../cli/cli.js";
import Schedule from "../utils/schedule.js";

export class Slot {

    public readonly index: Uint64;
    public readonly minter: AddressHex;

    private slot_started = false;

    public block: Block | null = null;
    public block_verification: Promise<BlockValidationResult> | null = null;
    private readonly blockTimeout: Schedule;

    private constructor(index: Uint64, minter: AddressHex) {
        this.index = index;
        this.minter = minter;

        this.blockTimeout = new Schedule(async() => await this.onBlockNotMinted(), 5000);
        this.onSlotStart();
    }

    public static async create(index: Uint64) {
        const nextMinter = await blockchain.minters.selectNextMinter(index);
        cli.minter.info(`Slot ${index.toBigInt()} minter: ${nextMinter.toHex()}`);
        return new Slot(index, nextMinter);
    }

    private async onSlotStart() {
        if (this.slot_started) return;
        this.slot_started = true;

        for (const mc of MinterClient.minters) {
            if (this.isMinter(mc.address)) {
                await MinterClient.mint(mc, this);
                break;
            }
        }
    }

    private async onBlockNotMinted() {
        if (this.blockTimeout.hasFinished()) return;
        this.blockTimeout.cancel();
        cli.leicoin_net.server.info(`Minter ${this.minter.toHex()} did not mint a block on Slot ${this.index.toBigInt()}`);
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
