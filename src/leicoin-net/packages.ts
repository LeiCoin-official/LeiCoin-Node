import { Uint } from "low-level";
import { LNMsgType } from "./messaging/messageTypes.js";

// export enum LeiCoinNetDataPackageType {
//     CHALLENGE = "0000",
//     CHALLENGE_RESULT = "0001",

//     MESSAGE = "1000",
//     BLOCK = "1001",
//     TRANSACTION = "1002",

//     // V means Minter
//     //V_PROPOSE = "1101",
//     //V_VOTE = "1102",
//     //V_SLASH_ATTESTER = "1103",
//     //V_SLASH_PROPOSER = "1104",
// }

interface LeiCoinNetDataPackageLike {
    type: LNMsgType;
    content: Uint;
}

export class LeiCoinNetDataPackage {

    public static create(type: LNMsgType, hexData: Uint) {
        return Buffer.concat([
            type.getRaw(),
            hexData.getRaw()
        ]);
    }

    public static extract(data: Uint | Buffer): LeiCoinNetDataPackageLike {
        return {
            type: new LNMsgType(data.subarray(0, 2)),
            content: new Uint(data.subarray(2))
        };
    }

}
