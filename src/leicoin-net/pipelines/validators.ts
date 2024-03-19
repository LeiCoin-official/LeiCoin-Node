import { AttestationSendData } from "../../objects/attestation.js";
import { LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import validatorsCommittee from "../../validators/committee.js";

export default class ValidatorPipeline {

    private static async checkReceive(type: LeiCoinNetDataPackageType, data: string) {

        const attestation = AttestationSendData.fromDecodedHex(data);
        if (!attestation) return false;

        if (attestation.nonce === validatorsCommittee.getMember(attestation.publicKey).nonce) {
            
        }

    }


    public static async receive(type: LeiCoinNetDataPackageType, data: string) {
        
        switch (type) {

            case LeiCoinNetDataPackageType.VALIDATOR_PROPOSE: {
                await this.checkReceive(type, data);

                break;
            }

            case LeiCoinNetDataPackageType.VALIDATOR_VOTE: {
                await this.checkReceive(type, data);

                break;
            }

            default:
                break;

        }

    }

    public static async broadcast(rawData: Buffer) {
        


    }
    

}