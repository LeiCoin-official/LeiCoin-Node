import Attestation from "../../objects/attestation.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import Proposition from "../../objects/proposition.js";
import leiCoinNetClientsHandler from "../client/index.js";
import Verification from "../../verification/index.js";
import { Uint } from "../../utils/binary.js";
import POS from "../../pos/index.js";
import { AddressHex } from "../../objects/address.js";

export default class ValidatorPipeline {

    private static async receiveProposition(type: LeiCoinNetDataPackageType, data: Uint) {

        const proposition = Proposition.fromDecodedHex(data) as Proposition;

        if (await Verification.verifyBlockProposition(proposition) !== 12000) return;

        this.broadcast(type, data, proposition.proposer);
        POS.getSlot(proposition.slotIndex).processProposition(proposition);

    }

    private static async receiveAttestation(type: LeiCoinNetDataPackageType, data: Uint) {

        const attestation = Attestation.fromDecodedHex(data) as Attestation;

        if (await Verification.verifyBlockAttestation(attestation) !== 12000) return;

        this.broadcast(type, data, attestation.attester);
        POS.getSlot(attestation.slotIndex).processAttestation(attestation);

    }


    public static async receive(type: LeiCoinNetDataPackageType, data: Uint) {
        switch (type) {
            case LeiCoinNetDataPackageType.V_PROPOSE: {
                await this.receiveProposition(type, data);
                break;
            }

            case LeiCoinNetDataPackageType.V_VOTE: {   
                await this.receiveAttestation(type, data);  
                break;
            }
        }
    }

    public static async broadcast(type: LeiCoinNetDataPackageType, data: Uint, address: AddressHex) {
        POS.getCurrentSlot().committee.getMemberData(address);
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }
    

}