import { DatabaseOptions, ClassicLevel } from "classic-level";
//const { DatabaseOptions, GetOptions, ClassicLevel: Level } = require("../../node_modules/classic-level/prebuilds/linux-x64/node.napi.glibc.node");
import { LevelDBEncoders } from "./encoders.js";
import { Uint } from "../../binary/uint.js";

export class LevelDB<K = Uint, V = Uint> extends ClassicLevel<K, V> {
    
    constructor(location: string, options?: DatabaseOptions<K, V> | string);
    constructor(location: string, options: DatabaseOptions<any, any> = {
        keyEncoding: LevelDBEncoders.Uint,
        valueEncoding: LevelDBEncoders.Uint
    }) {
        super(location, options);
    }

}

export default LevelDB;
