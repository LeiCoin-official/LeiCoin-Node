import { DatabaseOptions, GetOptions, Level } from "level";
//const { DatabaseOptions, GetOptions, ClassicLevel: Level } = require("../../node_modules/classic-level/prebuilds/linux-x64/node.napi.glibc.node");
import { LevelDBEncoders } from "../encoding/leveldbEncoders.js";
import { Uint } from "../binary/uint.js";

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
