import { DatabaseOptions, GetOptions, Level } from "level";
import { LevelDBEncoders } from "../encoding/leveldbEncoders.js";
import { Uint } from "../utils/binary.js";

export class LevelDB<K = Uint, V = Uint> extends Level<K, V> {
    
    constructor(location: string, options?: DatabaseOptions<K, V> | string);
    constructor(location: string, options: DatabaseOptions<any, any> = {
        keyEncoding: LevelDBEncoders.Uint,
        valueEncoding: LevelDBEncoders.Uint
    }) {
        super(location, options);
    }

}

export default LevelDB;
