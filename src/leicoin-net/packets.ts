import { Uint, Uint8 } from "low-level";

/** @todo packages, can not connect from local to remote */
/**
 * Represents a binary data chunk in the LeiCoin Network.
 */
export class LNDataChunk {

    /**
     * The maximum size of a data chunk.
     */
    static readonly MAX_CHUNK_SIZE = 8192;

    /**
     * Creates an instance of LNDataChunk.
     * 
     * @param flag - A flag represented as a Uint8.
     * 
     * Flag Values:
     * 
     * 0xff - The data is the last chunk.
     * 
     * 
     * @param data - The data represented as a Uint.
     */
    constructor(
        readonly flag: Uint8,
        readonly data: Uint,
    ) {}

    static create(data: Uint, isLast: boolean) {
        const flag = Uint8.from(
            isLast ? 0xff : 0x00
        );
        return new LNDataChunk(flag, data);
    }

    
    public isLast() {
        return this.flag.eq(0xff);
    }


    public encodeToHex() {
        return Uint.concat([this.flag, this.data]);
    }

    static fromDecodedHex(hexData: Uint) {

        if (hexData.getLen() < 1 || hexData.getLen() > LNDataChunk.MAX_CHUNK_SIZE + 1) {
            return null;
        }
        
        return new LNDataChunk(
            hexData.slice(0, 1),
            hexData.slice(1),
        );
    }

}
