import { AddressHex } from "../objects/address.js";
import { BasicUintConstructable, Uint, Uint256, Uint64 } from "../utils/binary.js";

interface RocksDBEncoderLike<T extends Uint> {
    readonly encode: (val: Uint | Uint8Array) => Uint8Array;
    readonly decode: (val: Uint8Array) => T;
    //readonly name: string;
    //readonly format: "buffer";
    readonly type: string;
    readonly buffer: true;
}

export class RocksDBEncoder<T extends Uint> implements RocksDBEncoderLike<T> {

    //public readonly name: string;
    //public readonly format = "buffer";
    public readonly type: string;
    public readonly buffer = true;
    private readonly CLS: BasicUintConstructable<T>;

    constructor(name: string, CLS: BasicUintConstructable<T>) {
        //this.name = name;
        this.type = name;
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


export const RocksDBEncoders = {
    Uint: new RocksDBEncoder<Uint>("uint", Uint),
    Uint64: new RocksDBEncoder<Uint64>("uint64", Uint64),
    Uint256: new RocksDBEncoder<Uint256>("uint256", Uint256),
    Address: new RocksDBEncoder<AddressHex>("address", AddressHex),
}

