import cli from "../cli/cli.js";
import { Uint64 } from "../binary/uint.js";
import Constants from "../utils/constants.js";
import utils from "../utils/index.js";
import Slot from "./slot.js";
import cron from "node-cron";
import { UintMap } from "../binary/map.js";
import API, { APICompatible, APILike } from "../api.js";
import { Static } from "../utils/dataUtils.js";

export class POS implements Static<typeof POS, APICompatible> {

    protected slotTask: cron.ScheduledTask;
    
    constructor(
        protected api: APILike,
        readonly slots: UintMap<Slot> = new UintMap<Slot>(),
        protected currentSlot: Slot | null = null
    ) {
        
        this.slotTask = cron.schedule('0,5,10,15,20,25,30,35,40,45,50,55 * * * * *', () => {
            const currentSlotIndex = Uint64.from(POS.calulateCurrentSlotIndex());
            cli.minter.info(`Starting new slot: ${currentSlotIndex.toBigInt()} at ${new Date().toUTCString()}`);
            //this.endSlot(this.currentSlot.index);
            this.startNewSlot(currentSlotIndex);
        });

        utils.events.once("stop_server", () => {
            this.slotTask.stop();
            cli.minter.info("POS stopped");
        });

        this.slotTask.start();

    }

    public static calulateCurrentSlotIndex() {
        return Math.floor(
            (Date.now() - Constants.GENESIS_TIME) / Constants.SLOT_TIME
        );
    }

    public async startNewSlot(slotIndex: Uint64) {
        const newSlot = await Slot.create(slotIndex);
        this.slots.set(slotIndex, newSlot);
        this.currentSlot = newSlot;
    }

    public async endSlot(slotIndex: Uint64) {
        return this.slots.delete(slotIndex);
    }

    public getSlot(index: Uint64) {
        return this.slots.get(index);
    }

    public getCurrentSlot() {
        return this.currentSlot;
    }
    
}

export default POS;
