import { Uint } from "../binary/uint.js";
import { LockedUint } from "../objects/prefix.js";

export class LNPPX extends LockedUint {
    public static readonly byteLength = 2;

    //static readonly CHALLENGE = NPPX.from("0000")
    //static readonly CHALLENGE_RESPONSE = NPPX.from("0001")

    static readonly MESSAGE = LNPPX.from("3b66")
    static readonly BLOCK = LNPPX.from("2096")
    static readonly TRANSACTION = LNPPX.from("427d")

}

// export enum LeiCoinNetDataPackageType 
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
    type: LNPPX;
    content: Uint;
}

export class LeiCoinNetDataPackage {

    public static create(type: LNPPX, hexData: Uint) {
        return Buffer.concat([
            type.getRaw(),
            hexData.getRaw()
        ]);
    }

    public static extract(data: Buffer): LeiCoinNetDataPackageLike {
        return {
            type: new LNPPX(data.subarray(0, 2)),
            content: Uint.from(data.subarray(2))
        };
    }

}
