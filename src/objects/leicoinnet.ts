import EncodingUtils from "../handlers/encodingHandlers.js";
import Block from "./block.js";
import Transaction from "./transaction.js";

export enum LeiCoinNetDataPackageType {
    BLOCK = "0001",
    TRANSACTION = "0002",
    MESSAGE = "0003",

    // V means Validator
    V_PROPOSE = "0101",
    V_VOTE = "0102",
    V_SLASH_ATTESTOR = "0103",
    // V_SLASH_PROPOSER = "0104",
}

const objectTypesTransaltionIndex: [any, LeiCoinNetDataPackageType][] = [
    [Block, LeiCoinNetDataPackageType.BLOCK],
    [Transaction, LeiCoinNetDataPackageType.TRANSACTION]
]

interface LeiCoinNetDataPackageLike {
    type: LeiCoinNetDataPackageType;
    content: string;
}

interface LeiCoinNetDataPackageContentObject {
    encodeToHex(add_empty_bytes: boolean): string;
}

interface LeiCoinNetDataPackageContentContructor {
    fromDecodedHex(hexData: string, returnLength?: boolean): any;
}

export class LeiCoinNetDataPackage {

    public static create(type: LeiCoinNetDataPackageType, hexData: string): Buffer;
    public static create<T extends LeiCoinNetDataPackageContentObject>(type: LeiCoinNetDataPackageType, content: T): Buffer;
    public static create<T extends LeiCoinNetDataPackageContentObject>(content: T): Buffer;
    public static create<T extends LeiCoinNetDataPackageContentObject>(type: LeiCoinNetDataPackageType, content?: T, hexData?: string) {

        if (content) {

            if (!type) {
                var type = LeiCoinNetDataPackageType.MESSAGE;

                for (const objType of objectTypesTransaltionIndex) {
                    if (content instanceof objType[0]) {
                        type = objType[1];
                    }
                }
            }

            return EncodingUtils.hexToBuffer(type + content.encodeToHex(true));
        } else if (hexData) {
            return EncodingUtils.hexToBuffer(type + hexData);
        }


    }

    public static extract(data: Buffer): LeiCoinNetDataPackageLike {
        const decoded = EncodingUtils.bufferToHex(data);
        const type = decoded.substring(0, 4) as LeiCoinNetDataPackageType;
        const content = decoded.substring(4, decoded.length);

        return { type, content };
    }

}
