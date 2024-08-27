import { AddressHex } from "../../objects/address.js";
import { BasicUintConstructable, Uint, Uint256, Uint64 } from "../../binary/uint.js";

interface LevelDBEncoderLike<T extends Uint> {
    readonly encode: (val: Uint | Uint8Array) => Uint8Array;
    readonly decode: (val: Uint8Array) => T;
    readonly name: string;
    readonly format: "buffer";
}

export class LevelDBEncoder<T extends Uint> implements LevelDBEncoderLike<T> {

    public readonly name: string;
    public readonly format = "buffer";
    private readonly CLS: BasicUintConstructable<T>;

    constructor(name: string, CLS: BasicUintConstructable<T>) {
        this.name = name;
        this.CLS = CLS;
    }

    public encode = (val: Uint | Uint8Array) => {
        return val instanceof Uint ? val.getRaw() : val;
    }

    public decode = (val: Uint8Array) => {
        return new this.CLS(Buffer.from(val));
    }

    /*
    public createViewTranscoder = () => {}
    public createBufferTranscoder = () => {}
    public createUTF8Transcoder = () => {}
    */

}


export const LevelDBEncoders = {
    Uint: new LevelDBEncoder<Uint>("uint", Uint),
    Uint64: new LevelDBEncoder<Uint64>("uint64", Uint64),
    Uint256: new LevelDBEncoder<Uint256>("uint256", Uint256),
    Address: new LevelDBEncoder<AddressHex>("address", AddressHex),
}

