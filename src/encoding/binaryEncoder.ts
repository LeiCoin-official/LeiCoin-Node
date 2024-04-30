import { Uint } from "../utils/binary.js";

export class BinaryEncoder {

    static encode(val: Uint) {
        return val.getRaw();
    }

    static decode(val: Buffer) {
        return Uint.from(val);
    }

    static readonly name = "uint";
    
    static readonly format = "buffer"; 

    /*
    static createViewTranscoder() {}
    static createBufferTranscoder() {}
    static createUTF8Transcoder() {}
    */
    
}

