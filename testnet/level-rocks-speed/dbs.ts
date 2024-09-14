import { ClassicLevel, DatabaseOptions } from "classic-level";
import LevelUP from "levelup";
import { Uint } from "../../src/binary/uint.js";
import { CodecOptions } from "level-codec";
import EncodingDown from "encoding-down";
import RocksDBDown from "rocksdb";
import { ErrorCallback } from 'abstract-leveldown';

const LevelDBEncoder = {
    name: "unit",
    format: "buffer",
    encode: (val: Uint | Uint8Array) => {
        return val instanceof Uint ? val.getRaw(): val;
    },
    decode: (val: Uint8Array) => {
        return Uint.from(val);
    }
}

const RocksDBEncoder = {
    type: "unit",
    buffer: true,
    encode: (val: Uint | Uint8Array) => {
        return val instanceof Uint ? val.getRaw(): val;
    },
    decode: (val: Uint8Array) => {
        return Uint.from(val);
    }
}

export class LevelDB<K = Uint, V = Uint> extends ClassicLevel<K, V> {
    
    constructor(location: string, options?: DatabaseOptions<K, V> | string);
    constructor(location: string, options: DatabaseOptions<any, any> = {
        keyEncoding: LevelDBEncoder,
        valueEncoding: LevelDBEncoder
    }) {
        super(location, options);
    }

}

export class RocksDB<K = Uint, V = Uint> extends LevelUP {
    
    //constructor(location: string, callback?: ErrorCallback);
    constructor(location: string, options?: CodecOptions, callback?: ErrorCallback);
    constructor(
        location: string,
        options: CodecOptions = {
            keyEncoding: RocksDBEncoder,
            valueEncoding: RocksDBEncoder
        },
        callback?: ErrorCallback
    ) {
        super(
            new EncodingDown<K, V>(
                new RocksDBDown(location),
                options,
            ),
            options,
            callback
        );
        
    }

    public static destroy(location: string, callback: ErrorCallback) {
        // @ts-ignore
        RocksDBDown.destroy(location, callback);
    }

    public static repair(location: string, callback: ErrorCallback) {
        // @ts-ignore
        RocksDBDown.repair(location, callback);
    }

}


