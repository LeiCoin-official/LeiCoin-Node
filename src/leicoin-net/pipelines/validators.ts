import { LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";

export default class ValidatorPipeline {


    public static async receive(type: LeiCoinNetDataPackageType, data: string) {
        
        switch (type) {

            case LeiCoinNetDataPackageType.VALIDATOR_PROPOSE:

                
                break;

            case LeiCoinNetDataPackageType.VALIDATOR_VOTE:


                break;
            
            default:
                break;

        }

    }

    public static async broadcast(rawData: Buffer) {
        


    }
    

}