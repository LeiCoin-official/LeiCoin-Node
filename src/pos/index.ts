import { Uint64 } from "../utils/binary.js";
import Constants from "../utils/constants.js";
import { Dict } from "../utils/dataUtils.js";
import Slot from "./slot.js";
import cron from "node-cron";

export class POS {

    private static initialized = false;

    public static readonly slots: Dict<Slot> = {};
    private static currentSlot: Slot;

    public static init() {

        if (this.initialized) return;
		this.initialized = true;
        
        const task = cron.schedule('0,5,10,15,20,25,30,35,40,45,50,55 * * * * *', () => {
            const currentSlotIndex = Uint64.from(this.calulateCurrentSlotIndex());
            //this.endSlot(this.currentSlot.index);
            this.startNewSlot(currentSlotIndex);
        });

        task.start();
        
    }

    public static calulateCurrentSlotIndex() {
        return Math.floor(
            (Date.now() - Constants.GENESIS_TIME) / Constants.SLOT_TIME
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
