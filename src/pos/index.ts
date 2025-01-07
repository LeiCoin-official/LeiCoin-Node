import cli from "../cli/cli.js";
import { Uint64, UintMap } from "low-level";
import Constants from "../utils/constants.js";
import Slot from "./slot.js";
import { type MinterClient } from "../minter/index.js";
import { type ModuleLike } from "../utils/dataUtils.js";
import { CronJob } from "cron";

export class POS implements ModuleLike<typeof POS> {
    public static initialized = false;
    public static started = false;

    private static slotTask: CronJob;
    private static readonly slots = new UintMap<Promise<Slot>>();

    static readonly minters: MinterClient[] = [];

    static async init(minters: MinterClient[]) {
        if (this.initialized) return;
        this.initialized = true;

        this.minters.push(...minters);
     
        this.slotTask = new CronJob('4,9,14,19,24,29,34,39,44,49,54,59 * * * * *', () => {
            const nextSlotIndex = Uint64.from(POS.calulateCurrentSlotIndex() + 1);

            //this.endSlot(this.currentSlot.index);
            this.startNewSlot(nextSlotIndex);

            /** @todo Adjust the amount of time this slot will be keeped in memory later when it is decided when a block is considered final and minters are getting paid */
            this.endSlot(nextSlotIndex.sub(100));
        });

        this.setupEvents();
    }

    static async start() {
        if (this.started) return;
        this.started = true;

        this.slotTask.start();
        cli.pos.info("POS started");
    }

    static setupEvents() {}
    
    static async stop() {
        if (!this.started) return;
        this.slotTask.stop();

        const currentSlot = await this.getCurrentSlot();
        if (currentSlot) {
            this.forceFinishAndDeleteSlot(currentSlot.index);
            await Promise.all([
                this.forceFinishAndDeleteSlot(currentSlot.index.sub(1)),
                this.forceFinishAndDeleteSlot(currentSlot.index.add(1))
            ]);
        }

        cli.pos.info("POS stopped");
    }

    static calulateCurrentSlotIndex() {
        return Math.floor(
            (Date.now() - Constants.GENESIS_TIME) / Constants.SLOT_TIME
        );
    }

    static calculateSlotExecutionTime(index: Uint64) {
        return Constants.GENESIS_TIME + index.toInt() * Constants.SLOT_TIME;
    }

    static async startNewSlot(slotIndex: Uint64) {
        const newSlot = Slot.create(slotIndex);
        this.slots.set(slotIndex, newSlot);
    }

    static async endSlot(slotIndex: Uint64) {
        return this.slots.delete(slotIndex);
    }

    static async forceFinishAndDeleteSlot(slotIndex: Uint64) {
        const slot = await this.getSlot(slotIndex);
        if (slot) {
            slot.slot_finished.pass();
            this.endSlot(slotIndex);
        }
    }

    static getSlot(index: Uint64) {
        return this.slots.get(index);
    }

    static getCurrentSlot() {
        return this.slots.get(Uint64.from(this.calulateCurrentSlotIndex()));
    }
    
}

export default POS;
