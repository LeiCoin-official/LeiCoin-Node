import { Level } from "level"
import type { CodecOptions } from "level-codec";
import { BinaryEncoder } from "../encoding/binaryEncoder.js";


export class LevelDB extends Level<Buffer, Buffer> {
    
    constructor(
        path: string,
        options: CodecOptions = {
            keyEncoding: BinaryEncoder,
            valueEncoding: BinaryEncoder
        }
    ) {
        super((path), {keyEncoding: "binary", valueEncoding: "binary"});
    }

}

export default LevelDB;
