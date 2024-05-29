import EncodingUtils from "../encoding/index.js";
import { Uint } from "../utils/binary.js";
import Block from "./block.js";
import Transaction from "./transaction.js";

export enum LeiCoinNetDataPackageType {
    BLOCK = "0001",
    TRANSACTION = "0002",
    MESSAGE = "0003",

    // V means Validator
    V_PROPOSE = "0101",
    V_VOTE = "0102",
    V_SLASH_ATTESTER = "0103",
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

    public static create(type: LeiCoinNetDataPackageType, hexData: Uint): Buffer;
    public static create<T extends LeiCoinNetDataPackageContentObject>(content: T): Buffer;
    public static create<T extends LeiCoinNetDataPackageContentObject>(type: LeiCoinNetDataPackageType, content: T): Buffer;
    public static create<T extends LeiCoinNetDataPackageContentObject>(typeORcontent: T | string, contentORhexData?: T | Uint) {

        let type: string;

        switch (typeof typeORcontent) {
            case "string": {
                // is type
                type = typeORcontent;
                break;
            }
            case "object": {
                // is content T
                type = LeiCoinNetDataPackageType.MESSAGE;
                for (const objType of objectTypesTransaltionIndex) {
                    if (typeORcontent instanceof objType[0]) {
                        type = objType[1];
                        break;
                    }
                }
                return EncodingUtils.hexToBuffer(type + typeORcontent.encodeToHex(true));
            }
        }

        switch (typeof contentORhexData) {
            case "string": {
                // is hexData
                return EncodingUtils.hexToBuffer(type + contentORhexData);
            }
            case "object": {
                // is content T
                return EncodingUtils.hexToBuffer(type + contentORhexData.encodeToHex(true));
            }
        }

    }

    public static extract(data: Buffer): LeiCoinNetDataPackageLike {
        const decoded = EncodingUtils.bufferToHex(data);
        const type = decoded.slice(0, 4) as LeiCoinNetDataPackageType;
        const content = decoded.slice(4, decoded.length);

        return { type, content };
    }

}
