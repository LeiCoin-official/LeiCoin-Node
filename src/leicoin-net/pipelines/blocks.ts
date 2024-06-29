import Verification from "../../verification/index.js"
import Block from "../../objects/block.js";
import leiCoinNetClientsHandler from "../client/index.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import { Uint } from "../../utils/binary.js";
import POS from "../../pos/index.js";

export default class BlockPipeline {

    public static async receive(type: LeiCoinNetDataPackageType, data: Uint) {
        const block = Block.fromDecodedHex(data) as Block;

        if (await Verification.verifyMintedBlock(block) !== 12000) return;

        this.broadcast(type, data);
        POS.getSlot(block.slotIndex).processBlock(block);

    }

    public static async broadcast(type: LeiCoinNetDataPackageType, data: Uint) {
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }
    

}