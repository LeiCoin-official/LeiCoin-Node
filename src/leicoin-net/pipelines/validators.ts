import { pipeline } from "stream";
import { AttestationSendData } from "../../objects/attestation.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import validatorsCommittee from "../../validators/committee.js";
import validator from "../../validators/index.js";
import Proposition from "../../objects/proposition.js";
import leiCoinNetClientsHandler from "../client/index.js";
import Verification from "../../verification/index.js";
import cryptoHandlers from "../../handlers/cryptoHandlers.js";
import { proposerJob } from "../../validators/job.js";

export default class ValidatorPipeline {

    private static async receiveProposition(type: LeiCoinNetDataPackageType, data: string) {

        const proposition = Proposition.fromDecodedHex(data) as Proposition;

        if (await Verification.verifyBlockProposition(proposition) !== 12000) return;

        this.broadcast(type, data, proposition.proposer);

        (async function() {
            if (validatorsCommittee.isCurrentAttestor(validator.publicKey)) {

                proposerJob.create

            }
        })();

    }

    private static async receiveAttestation(type: LeiCoinNetDataPackageType, data: string) {

        const attestation = AttestationSendData.fromDecodedHex(data);

        if (!attestation) return;
        if (attestation.nonce !== validatorsCommittee.getMember(attestation.publicKey)?.nonce) return;

        (async function() {
            if (validatorsCommittee.isCurrentProposer(validator.publicKey)) {
            
                
            
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

    public static async broadcast(type: LeiCoinNetDataPackageType, data: string, committeeMemberPubKey: string) {
        validatorsCommittee.getMember(committeeMemberPubKey).adjustNonce();
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }
    

}