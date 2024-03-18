import EncodingUtils from "../handlers/encodingHandlers";

export enum LeiCoinNetDataPackageType {
    BLOCK = "0001",
    TRANSACTION = "0002",
    MESSAGE = "0003"
}

interface LeiCoinNetDataPackageLike {
    type: string;
    content: string;
}

interface LeiCoinNetDataPackageContentObject {
    encodeToHex(add_empty_bytes: boolean): string;
}

interface LeiCoinNetDataPackageContentContructor {
    fromDecodedHex(hexData: string, returnLength?: boolean): any;
}

export class LeiCoinNetDataPackage {

    public static create<T extends LeiCoinNetDataPackageContentObject>(type: LeiCoinNetDataPackageType, content: T) {
        return EncodingUtils.hexToBuffer(type + content.encodeToHex(true));
    }

    public static extract(data: Buffer): LeiCoinNetDataPackageLike {
        const decoded = EncodingUtils.bufferToHex(data);
        const type = decoded.substring(0, 4);
        const content = decoded.substring(4, decoded.length);

        return {type, content };
    }

}
