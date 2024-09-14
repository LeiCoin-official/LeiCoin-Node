import { AddressHex } from "../objects/address.js";
import { type Block } from "../objects/block.js";
import { type Uint64 } from "../binary/uint.js";
import Verification, { BlockValidationResult } from "../verification/index.js";
import { Execution } from "./execution.js";
import { Blockchain } from "../storage/blockchain.js";
import cli from "../cli/cli.js";
import Schedule from "../utils/schedule.js";
import POS from "./index.js";
import { ExternalPromise } from "../utils/externalPromise.js";
import { formatDate } from "date-fns/format";
import { UTCDate } from "@date-fns/utc/date";

export class Slot {

    public block?: Block;

    protected slot_started = false;
    readonly slot_finished: ExternalPromise<void>;
    protected readonly blockTimeout: Schedule;

    protected constructor(
        readonly index: Uint64,
        readonly minter: AddressHex,
    ) {
        this.slot_finished = new ExternalPromise();
        this.blockTimeout = new Schedule(async() => await this.onBlockNotMinted(), 6000);
        new Schedule(async() => await this.onSlotStart(), 1000);
    }

    static async create(index: Uint64) {
        const latestSlot = await POS.getSlot(index.sub(1));
        if (latestSlot) {
            // Ensure minterdb was upodated before selecting the next minter
            await latestSlot.slot_finished.result;
        }

        const nextMinter = await Blockchain.minters.selectNextMinter(index);
        return new Slot(index, nextMinter);
    }

    protected async onSlotStart() {
        if (this.slot_finished.finished || this.slot_started) return;
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
        if (this.slot_finished.finished || this.blockTimeout.hasFinished()) return;
        console.log(this.blockTimeout.hasFinished());
        this.blockTimeout.cancel();
        this.slot_finished.resolve();
        cli.pos.error(`Minter ${this.minter.toHex()} did not mint a block on Slot ${this.index.toBigInt()}`);
    }


    public async processBlock(block: Block) {
        if (this.slot_finished.finished || this.blockTimeout.hasFinished()) return;
        this.blockTimeout.cancel();

        if (this.block) { this.slot_finished.resolve(); return; }
        this.block = block;
        
        const latestSlot = await POS.getSlot(this.index.sub(1));
        if (latestSlot) {
            // Ensure minterdb was upodated before trying to verify and execute the next block
            await latestSlot.slot_finished.result;
        }

        const verification_result = await Verification.verifyBlock(block);

        this.slot_finished.resolve(
            await Execution.executeBlock(block, verification_result)
        );
    }

    public isMinter(address: AddressHex) {
        return this.minter.eq(address);
    }

}

export default Slot;
