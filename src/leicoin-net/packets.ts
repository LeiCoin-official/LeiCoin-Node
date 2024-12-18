import { Uint, Uint16 } from "low-level";

export class LNDataChunk {

    static readonly MAX_CHUNK_SIZE = 8192;

    constructor(
        readonly chunkIndex: Uint16,
        readonly totalChunks: Uint16,
        readonly data: Uint,
    ) {}

}
