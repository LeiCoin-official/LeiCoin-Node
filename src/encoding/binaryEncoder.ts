import { Uint } from "../utils/binary.js";

interface BinaryEncoder {
    readonly encode: (val: Uint) => Buffer;
    readonly decode: (val: Buffer) => Uint;
    readonly name: "uint";
    readonly format: "buffer";
}

export const BinaryEncoder: BinaryEncoder = {
    encode: (val: Uint) => {
        return val.getRaw();
    },
    decode: (val: Buffer) => {
        return new Uint(val);
    },
    name: "uint",
    format: "buffer",
    /*
    createViewTranscoder: () => {}
    createBufferTranscoder: () => {}
    createUTF8Transcoder: () => {}
    */
}

