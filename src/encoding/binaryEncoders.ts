import { Uint } from "../utils/binary.js";


abstract class BinaryEncoder {
    abstract defaultLength?: number;
    abstract lengthBefore?: boolean;
    abstract encode?(v: any): Uint;
    abstract parse?(v: Uint): any;
}

interface EncodingSettings {
    key: string;
    length?: number;
    lengthBefore?: boolean | "unlimited";
    type?: DefaultDataTypes;
    hashRemove?: boolean,
    decodeFunc?(hexData: Uint, returnLength: boolean): any;
    encodeFunc?(forHash: boolean): Uint;
}




