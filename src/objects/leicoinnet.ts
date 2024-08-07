import { Uint } from "../utils/binary.js";

export enum LeiCoinNetDataPackageType {
    BLOCK = "0001",
    TRANSACTION = "0002",
    MESSAGE = "0003",

    // V means Minter
    //V_PROPOSE = "0101",
    //V_VOTE = "0102",
    //V_SLASH_ATTESTER = "0103",
    //V_SLASH_PROPOSER = "0104",
}

interface LeiCoinNetDataPackageLike {
    type: LeiCoinNetDataPackageType;
    content: Uint;
}

export class LeiCoinNetDataPackage {

    public static create(type: LeiCoinNetDataPackageType, hexData: Uint) {
        return Buffer.concat([
            Buffer.from(type, "hex"),
            hexData.getRaw()
        ]);
    }

    public static extract(data: Buffer): LeiCoinNetDataPackageLike {
        return {
            type: data.subarray(0, 2).toString("hex") as LeiCoinNetDataPackageType,
            content: Uint.from(data.subarray(2))
        };
    }

}
