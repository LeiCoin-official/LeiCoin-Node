import { Uint64 } from "../utils/binary.js";
import { Dict } from "../utils/dataUtils.js";
import Slot from "./slot.js";

export class POS {

    public static slots: Dict<Slot>;

    public static init() {

    }

    public static async startNewSlot(slotIndex: Uint64) {
        this.currentSlot = await Slot.create(slotIndex);
    }

}

export default POS;
