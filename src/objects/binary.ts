// export class Bytes32 extends Buffer {

//     static hasCorrectByteLength(buffer: Buffer) {
//         return buffer.byteLength === 32;
//     }

//     static getWithOffset(buffer: Buffer) {
//         const offsetNeeded = 32 - buffer.byteLength;
//         if (offsetNeeded <= 0) return buffer;
//         return Buffer.concat([Buffer.alloc(2), buffer])
//     }

// }

type ByteArray = ArrayLike<number>;

class Bytes extends Uint8Array {

    protected constructor(length: number);
    protected constructor(array: ByteArray, length?: number);
    protected constructor(arrayORlength: ByteArray | number, length?: number) {
        if (length) {
            super(length);
            this.set(arrayORlength as ByteArray, length - (arrayORlength as ByteArray).length)
        }
    }

}

class Bytes32 extends Bytes {

    private constructor(array?: ByteArray) {
        if (array) {
            super(array, 32);
        } else {
            super(32);
        }
    }

}