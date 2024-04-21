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

interface BytesConstructable<T> {
    alloc(length?: number): T;
}

type Uint8ArrayLikes = Iterable<number> | ArrayLike<number>;

type HexArray = string[];
type IntArray = bigint[] | number[] | ArrayLike<number>;
type IOLikes = string | bigint | number | HexArray | IntArray;
type InputLikes = IOLikes;
type IOEncodings = "hex" | "bigint" | "number" | "hexarray" | "intarray";

export type ByteArray = ArrayLike<number>;

class BytesUtils {

    static fromHexArray<T extends Bytes>(input: HexArray, CLS: BytesConstructable<T>) {
        const bytes = CLS.alloc(input.length);
        for (const [i, item] of input.entries()) {
            bytes[i] = parseInt(item, 16);
        }
        return bytes;
    }

    static fromHex<T extends Bytes>(input: string, CLS: BytesConstructable<T>) {
        const bytes = CLS.alloc(input.length / 2);
        for (let i = 0; i < input.length / 2; i++) {
            bytes[i] = parseInt(input.substring(i * 2, (i * 2) + 2), 16);
        }
        return bytes;
    }
    
    static encodingsOperations = {
        hex: {

        },
        bigint: {

        },
        number: {

        },
        array: {

        }
    }

    static from(input: IOLikes, enc?: IOEncodings) {

        switch (enc) {
            
        }

    }

}



export class Bytes extends Uint8Array {
    
    constructor(arrayORlength: ByteArray | number) {
        super(arrayORlength as any);
    }

    static new(arrayORlength: number | ByteArray) {
        return new Bytes(arrayORlength);
    }

    public static alloc(length: number) {
        return new Bytes(length);
    }

    public static from(arrayLike: InputLikes, enc: string): Bytes;
    public static from(base: Uint8ArrayLikes, enc?: any): Bytes;
    public static from(arrayLike: Uint8ArrayLikes | InputLikes, enc?: string) {
        //return new Bytes(base);
        return new Uint8Array(1);
    }

}

export class Bytes32 extends Bytes {

    constructor(array?: ByteArray) {
        if (array) {
            super(array)
        } else {
            super(32);
        }
    }

    public static alloc() {
        return new Bytes32();
    }

}

BytesUtils.fromHexArray([], Bytes32)
