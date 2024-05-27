import { Uint64 } from "../utils/binary.js";
import Slot from "./slot.js";

export class POS {

    private static slots: Map<string, Slot> = new Map();

    public static init() {

    }

    public static async startNewSlot(slotIndex: Uint64) {
        this.slots.set(slotIndex.toHex(), await Slot.create(slotIndex));
    }

    public static getCurrentSlot() {
        //this.slots.get()
    }

}

export default POS;
