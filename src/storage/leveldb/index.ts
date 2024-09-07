import { DatabaseOptions, ClassicLevel } from "classic-level";
import { LevelDBEncoders } from "./encoders.js";
import { Uint } from "../../binary/uint.js";
import { EntryStream, KeyStream, ReadStreamOptions, ValueStream } from "level-read-stream";
import type { AbstractIteratorOptions, AbstractKeyIteratorOptions, AbstractValueIteratorOptions } from "abstract-level";

export class LevelDB<K = Uint, V = Uint> extends ClassicLevel<K, V> {
    
    constructor(location: string, options?: DatabaseOptions<K, V> | string);
    constructor(location: string, options: DatabaseOptions<any, any> = {
        keyEncoding: LevelDBEncoders.Uint,
        valueEncoding: LevelDBEncoders.Uint
    }) {
        super(location, options);
    }

    public createReadStream(options?: ReadStreamOptions & Omit<AbstractIteratorOptions<K, V>, 'keys' | 'values'>) {
        return new EntryStream(this, options);
    }

    public createKeyStream(options?: ReadStreamOptions & AbstractKeyIteratorOptions<K>) {
        return new KeyStream(this, options);
    }

    public createValueStream(options?: ReadStreamOptions & AbstractValueIteratorOptions<K, V>) {
        return new ValueStream(this, options);
    }

}

export default LevelDB;
