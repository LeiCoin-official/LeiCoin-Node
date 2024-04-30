import levelup from "levelup";
import leveldown from "leveldown";
import levelencode from "encoding-down";
import type { CodecOptions } from "level-codec";
import { BinaryEncoder } from "../encoding/binaryEncoder.js";


export class LevelDB {

    private readonly db: levelup.LevelUp;

    constructor(
        path: string,
        options: CodecOptions = {
            keyEncoding: BinaryEncoder,
            valueEncoding: BinaryEncoder
        }
    ) {
        this.db = levelup(levelencode(leveldown(path), options));
    }

}

export default LevelDB;
