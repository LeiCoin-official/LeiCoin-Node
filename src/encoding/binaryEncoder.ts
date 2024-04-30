import { Uint } from "../utils/binary.js";

export class BinaryEncoder {

    static encode(val: Uint) {
        return val.getRaw();
    }

    static decode(val: Buffer) {
        return Uint.from(val);
    }

    static readonly type = "uint";

    static readonly buffer = true;    
    
}

