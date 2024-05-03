import { BasicUintConstructable, Uint, Uint256, Uint64 } from "../utils/binary.js";

interface BinaryEncoderLike<T extends Uint> {
    readonly encode: (val: T | Buffer) => Buffer;
    readonly decode: (val: Buffer) => T;
    readonly name: string;
    readonly format: "buffer";
}

class BinaryEncoder<T extends Uint> implements BinaryEncoderLike<T> {

    public readonly name: string;
    public readonly format = "buffer";
    private readonly CLS: BasicUintConstructable<T>;

    constructor(name: string, CLS: BasicUintConstructable<T>) {
        this.name = name;
        this.CLS = CLS;
    }

    public encode = (val: T | Buffer) => {
        return (val as T).getRaw ? (val as T).getRaw() : (val as Buffer);
    }

    public decode = (val: Buffer) => {
        return new this.CLS(val);
    }

    /*
    public createViewTranscoder = () => {}
    public createBufferTranscoder = () => {}
    public createUTF8Transcoder = () => {}
    */

}


export const UintEncoder = new BinaryEncoder("uint", Uint);
export const Uint64Encoder = new BinaryEncoder("uint64", Uint64);
export const Uint256Encoder = new BinaryEncoder("uint256", Uint256);
