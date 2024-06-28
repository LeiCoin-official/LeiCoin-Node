import Attestation from "../objects/attestation.js";
import { AttesterSlashing, ProposerSlashing } from "../objects/slashing.js";
import { Uint64 } from "../utils/binary.js";
import Constants from "../utils/constants.js";
import { Dict } from "../utils/dataUtils.js";
import Slot from "./slot.js";
import cron from "node-cron";

export class POS {

    public static readonly slots: Dict<Slot> = {};
    private static currentSlot: Slot;

    public static readonly watingAttestations: Attestation[] = [];
    public static readonly watingProposerSlashings: ProposerSlashing[] = [];
    public static readonly watingAttesterSlashings: AttesterSlashing[] = [];

    public static init() {
        
        const task = cron.schedule('0,15,30,45 * * * * *', () => {
            const currentSlotIndex = Uint64.from(this.calulateCurrentSlotIndex());
            //this.endSlot(this.currentSlot.index);
            this.startNewSlot(currentSlotIndex);
        });

        task.start();
        
    }

    public static calulateCurrentSlotIndex() {
        return Math.floor(
            (Date.now() - Constants.GENESIS_TIME) / Constants.BLOCK_TIME
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
