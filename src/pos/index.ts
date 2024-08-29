import cli from "../cli/cli.js";
import { Uint64 } from "../binary/uint.js";
import Constants from "../utils/constants.js";
import utils from "../utils/index.js";
import Slot from "./slot.js";
import cron from "node-cron";
import { UintMap } from "../binary/map.js";
import { type MinterClient } from "../minter/index.js";
import { ModuleLike } from "../utils/dataUtils.js";

export class POS implements ModuleLike<typeof POS> {

    private static slotTask: cron.ScheduledTask;
    static readonly slots: UintMap<Slot> = new UintMap<Slot>();
    private static currentSlot: Slot | null = null;

    static readonly minters: MinterClient[] = [];

    static async init(minters: MinterClient[]) {
        this.minters.push(...minters);
     
        this.slotTask = cron.schedule('0,5,10,15,20,25,30,35,40,45,50,55 * * * * *', () => {
            const currentSlotIndex = Uint64.from(POS.calulateCurrentSlotIndex());
            cli.pos.info(`Starting new slot: ${currentSlotIndex.toBigInt()} at ${new Date().toUTCString()}`);
            //this.endSlot(this.currentSlot.index);
            this.startNewSlot(currentSlotIndex);
        });

        this.setupEvents();
    }

    static async start() {
        cli.pos.info("POS started");
        this.slotTask.start();
    }

    static setupEvents() {
        utils.events.once("stop_server", () => {
            this.slotTask.stop();
        });
    }
    
    static stop() {
        this.slotTask.stop();
        cli.minter.info("POS stopped");
    }

    static calulateCurrentSlotIndex() {
        return Math.floor(
            (Date.now() - Constants.GENESIS_TIME) / Constants.SLOT_TIME
        );
    }

    static async startNewSlot(slotIndex: Uint64) {
        const newSlot = await Slot.create(slotIndex);
        this.slots.set(slotIndex, newSlot);
        this.currentSlot = newSlot;
    }

    static async endSlot(slotIndex: Uint64) {
        return this.slots.delete(slotIndex);
    }

    static getSlot(index: Uint64) {
        return this.slots.get(index);
    }

    static getCurrentSlot() {
        return this.currentSlot;
    }
    
}

export default POS;
