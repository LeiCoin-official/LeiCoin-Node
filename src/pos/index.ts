import { Uint64 } from "../utils/binary.js";
import { Dict } from "../utils/dataUtils.js";
import Slot from "./slot.js";

export class POS {

    private static slots: Dict<Slot> = {};
    private static currentSlot: Slot;

    public static init() {

    }

    public static async startNewSlot(slotIndex: Uint64) {
        const newSlot = await Slot.create(slotIndex);
        this.slots[slotIndex.toHex()] = newSlot;
        this.currentSlot = newSlot;
    }

    public static getCurrentSlot() {
        return this.currentSlot;
    }

}

export default POS;
