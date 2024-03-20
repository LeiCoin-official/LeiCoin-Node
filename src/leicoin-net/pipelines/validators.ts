import { pipeline } from "stream";
import { AttestationSendData } from "../../objects/attestation.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import validatorsCommittee from "../../validators/committee.js";
import validator from "../../validators/index.js";
import Proposition from "../../objects/proposition.js";
import leiCoinNetClientsHandler from "../client/index.js";

export default class ValidatorPipeline {

    private static async receiveProposition(type: LeiCoinNetDataPackageType, data: string) {

        const proposition = Proposition.fromDecodedHex(data);

        if (!proposition) return { cb: false };
        if (proposition.nonce !== validatorsCommittee.getMember(proposition.proposer)?.nonce) return { cb: false };

        if ()

        (async function() {

            if (validator.active && validatorsCommittee.isMember(validator.privateKey)) {



            }

        })();

    }

    private static async receiveAttestation(type: LeiCoinNetDataPackageType, data: string) {

        const attestation = AttestationSendData.fromDecodedHex(data);

        if (!attestation) return { cb: false };
        if (attestation.nonce !== validatorsCommittee.getMember(attestation.publicKey)?.nonce) return { cb: false };

        (async function() {

            if (validator.active && validatorsCommittee.getCurrentProposer() === validator.publicKey) {
                        


            }            

        })();

    }


    public static async receive(type: LeiCoinNetDataPackageType, data: string) {
        switch (type) {
            case LeiCoinNetDataPackageType.VALIDATOR_PROPOSE: {
                await this.receiveProposition(type, data);
                break;
            }

            case LeiCoinNetDataPackageType.VALIDATOR_VOTE: {   
                await this.receiveAttestation(type, data);  
                break;
            }
        }
    }

    public static async broadcast(type: LeiCoinNetDataPackageType, data: string) {
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }
    

}