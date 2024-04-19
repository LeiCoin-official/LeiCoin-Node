export class Bytes32 extends Buffer {

    static hasCorrectByteLength(buffer: Buffer) {
        return buffer.byteLength === 32;
    }

    static getWithOffset(buffer: Buffer) {
        const offsetNeeded = 32 - buffer.byteLength;
        if (offsetNeeded <= 0) return buffer;
        return Buffer.concat([Buffer.alloc(2), buffer])
    }

}


