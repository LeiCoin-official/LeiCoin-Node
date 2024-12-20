import { AddressHex } from "../objects/address.js";
import { type Block } from "../objects/block.js";
import { type Uint64 } from "low-level";
import Verification from "../verification/index.js";
import { Execution } from "./execution.js";
import { Blockchain } from "../storage/blockchain.js";
import cli from "../cli/cli.js";
import Schedule from "../utils/schedule.js";
import POS from "./index.js";
import { Deferred } from "../utils/deferred.js";
import { formatDate } from "date-fns/format";
import { UTCDate } from "@date-fns/utc/date";
import { VCodes } from "../verification/codes.js";

export class Slot {

    public block?: Block;

    protected slot_started = false;
    readonly slot_finished: Deferred<void>;
    protected readonly blockTimeout: Schedule;

    protected constructor(
        readonly index: Uint64,
        readonly minter: AddressHex,
    ) {
        this.slot_finished = new Deferred();
        new Schedule(async() => await this.onSlotStart(), 1000);
        this.blockTimeout = new Schedule(async() => await this.onBlockNotMinted(), 6000);
    }

    static async create(index: Uint64) {
        const latestSlot = await POS.getSlot(index.sub(1));
        if (latestSlot) {
            // Ensure minterdb was upodated before selecting the next minter
            await latestSlot.slot_finished.awaitResult();
        }

        const nextMinter = await Blockchain.minters.selectNextMinter(index);
        return new Slot(index, nextMinter);
    }

    protected async onSlotStart() {
        if (this.slot_finished.isResolved() || this.slot_started) return;
        this.slot_started = true;

        cli.pos.info(`Starting new slot: ${this.index.toBigInt()} at ${formatDate(new UTCDate(), "dd-MMM-yyyy HH:mm:ss:SSS")}, Minter: ${this.minter.toHex()}`);

        for (const mc of POS.minters) {
            if (this.isMinter(mc.credentials.address)) {
                await mc.mint(this);
                break;
            }
        }
    }

    protected async onBlockNotMinted() {
        if (this.slot_finished.isResolved()) return;

        this.slot_finished.resolve();
        cli.pos.error(`Minter ${this.minter.toHex()} did not mint a block on Slot ${this.index.toBigInt()}`);
    }


    public async processBlock(block: Block) {
        if (this.slot_finished.isResolved() || this.blockTimeout.hasFinished()) return;
        this.blockTimeout.cancel();

        if (this.block) { this.slot_finished.resolve(); return; }
        this.block = block;
        
        const latestSlot = await POS.getSlot(this.index.sub(1));
        if (latestSlot) {
            // Ensure minterdb was upodated before trying to verify and execute the next block
            await latestSlot.slot_finished.awaitResult();
        }

        const verification_result = await Verification.verifyBlock(block);

        if (verification_result.status !== 12000) {
            this.slot_finished.resolve();
            cli.pos.error(`Block with hash ${block.hash.toHex()} is invalid. Validation Result: Code: ${verification_result.status} Message: ${VCodes[verification_result.status]}`);
            return;
        }

        const execution_result = await Execution.executeBlock(block, verification_result);
        this.slot_finished.resolve();

        if (execution_result.forked) {
            cli.pos.info(`New Fork ${verification_result.targetChain} created from ${verification_result.parentChain} at block ${block.index.toBigInt()}`);
            return;
        }
        cli.pos.success(`Block on Slot ${block.slotIndex.toBigInt()} has been validated, executed and added to Blockchain. (Hash: ${block.hash.toHex()}, Index ${block.index.toBigInt()}, Target Chain: ${verification_result.targetChain})`);
    }

    public isMinter(address: AddressHex) {
        return this.minter.eq(address);
    }

    static async processPastSlot(index: Uint64, block?: Block) {

        const minter = await Blockchain.minters.selectNextMinter(index);

        if (!block || block.minter.eqn(minter)) {
            return false;
        }

        const verification_result = await Verification.verifyBlock(block);

        if (verification_result.status !== 12000) {
            return false;
        }

        await Execution.executeBlock(block, verification_result);
        return true;
    }

}

export default Slot;
