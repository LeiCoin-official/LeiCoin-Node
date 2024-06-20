import { Uint64 } from "../utils/binary.js";
import Constants from "../utils/constants.js";
import { Dict } from "../utils/dataUtils.js";
import Slot from "./slot.js";
import cron from "node-cron";

export class POS {

    private static slots: Dict<Slot> = {};
    private static currentSlot: Slot;

    public static init() {

        const currentSlotIndex = Uint64.from(this.calulateCurrentSlotIndex());
        this.startNewSlot(currentSlotIndex);
        const task = cron.schedule('0,15,30,45 * * * * *', () => {
            const currentSlotIndex = Uint64.from(this.calulateCurrentSlotIndex());
            if (currentSlotIndex.gt(this.currentSlot.index)) {
                //this.endSlot(this.currentSlot.index);
                this.startNewSlot(currentSlotIndex);
            }
        });

        task.start();
        
    }

    public static calulateCurrentSlotIndex() {
        return Math.floor(
            (Math.floor(Date.now() / 1000) - Constants.GENESIS_TIME) / Constants.BLOCK_TIME
        );
    }

    public static async startNewSlot(slotIndex: Uint64) {
        const newSlot = await Slot.create(slotIndex);
        this.slots[slotIndex.toHex()] = newSlot;
        this.currentSlot = newSlot;
    }

    public static async endSlot(slotIndex: Uint64) {
        delete this.slots[slotIndex.toHex()];
    }

    public static getSlot(index: Uint64) {
        return this.slots[index.toHex()];
    }

    public static getCurrentSlot() {
        return this.currentSlot;
    }
    
}

export default POS;
