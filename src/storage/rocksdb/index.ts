import LevelUP from 'levelup';
import EncodingDown from 'encoding-down';
import RocksDBDown from 'rocksdb';
import { ErrorCallback } from 'abstract-leveldown';
import { CodecOptions } from 'level-codec';
import { RocksDBEncoders } from "../../encoding/leveldbEncoders.js";
import { Uint } from "../../utils/binary.js";

export class RocksDB<K = Uint, V = Uint> extends LevelUP {
    
    //constructor(location: string, callback?: ErrorCallback);
    constructor(location: string, options?: CodecOptions, callback?: ErrorCallback);
    constructor(
        location: string,
        options: CodecOptions = {
            keyEncoding: RocksDBEncoders.Uint,
            valueEncoding: RocksDBEncoders.Uint
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

    public static repair(location: string, callback: (err: Error | undefined) => void) {
        // @ts-ignore
        RocksDBDown.repair(location, callback);
    }

}

export default RocksDB;
