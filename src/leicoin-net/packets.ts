import { Uint, Uint16 } from "low-level";
/** @todo packages, can not connect from local to remote */
export class LNDataChunk {

    static readonly MAX_CHUNK_SIZE = 8192;

    constructor(
        readonly chunkIndex: Uint16,
        readonly totalChunks: Uint16,
        readonly data: Uint,
    ) {}

}
