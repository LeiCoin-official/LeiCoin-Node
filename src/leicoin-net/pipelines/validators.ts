import { AttestationSendData } from "../../objects/attestation.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import validatorsCommittee from "../../validators/committee.js";
import Proposition from "../../objects/proposition.js";
import leiCoinNetClientsHandler from "../client/index.js";
import Verification from "../../verification/index.js";
import { AttesterJob, ProposerJob } from "../../validators/job.js";

export default class ValidatorPipeline {

    private static async receiveProposition(type: LeiCoinNetDataPackageType, data: string) {

        const proposition = Proposition.fromDecodedHex(data) as Proposition;

        if (await Verification.verifyBlockProposition(proposition) !== 12000) return;

        this.broadcast(type, data, proposition.proposer);
        AttesterJob.processProposition(proposition);

    }

    private static async receiveAttestation(type: LeiCoinNetDataPackageType, data: string) {

        const attestation = AttestationSendData.fromDecodedHex(data);

        if (!attestation) return;
        if (attestation.nonce !== validatorsCommittee.getMember(attestation.publicKey)?.nonce) return;

        ProposerJob.processAttestation(attestation);

    }


    public static async receive(type: LeiCoinNetDataPackageType, data: string) {
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

    public static async broadcast(type: LeiCoinNetDataPackageType, data: string, committeeMemberPubKey: string) {
        validatorsCommittee.getMember(committeeMemberPubKey).adjustNonce();
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }
    

}