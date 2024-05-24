import { AddressHex } from "../objects/address.js";
import { BasicUintConstructable, Uint, Uint256, Uint64 } from "../utils/binary.js";

interface BinaryEncoderLike<T extends Uint> {
    readonly encode: (val: Uint | Uint8Array) => Uint8Array;
    readonly decode: (val: Uint8Array) => T;
    readonly name: string;
    readonly format: "buffer";
}

export class BinaryEncoder<T extends Uint> implements BinaryEncoderLike<T> {

    public readonly name: string;
    public readonly format = "buffer";
    private readonly CLS: BasicUintConstructable<T>;

    constructor(name: string, CLS: BasicUintConstructable<T>) {
        this.name = name;
        this.CLS = CLS;
    }

    public encode = (val: Uint | Uint8Array) => {
        return (val as T).getRaw ? (val as T).getRaw() : (val as Uint8Array);
    }

    public decode = (val: Uint8Array) => {
        return new this.CLS(Buffer.copyBytesFrom(val));
    }

    /*
    public createViewTranscoder = () => {}
    public createBufferTranscoder = () => {}
    public createUTF8Transcoder = () => {}
    */

}


export const UintEncoder = new BinaryEncoder<Uint>("uint", Uint);
export const Uint64Encoder = new BinaryEncoder<Uint64>("uint64", Uint64);
export const Uint256Encoder = new BinaryEncoder<Uint256>("uint256", Uint256);
export const AddressEncoder = new BinaryEncoder<AddressHex>("address", AddressHex);
