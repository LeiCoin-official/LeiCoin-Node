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

type BufferConstructorLikes = ArrayLike<number> | WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer | ArrayLike<number> | string> | { [Symbol.toPrimitive](hint: "string"): string; };

type HexArray = string[];
type IntArray = bigint[] | number[] | ArrayLike<number>;
type IOLikes = string | bigint | number | HexArray | IntArray;
type InputLikes = IOLikes;
type IOEncodings = "hex" | "bigint" | "number" | "hexarray" | "intarray";

export type ByteArray = ArrayLike<number> ;

class BytesUtils {

    static fromHexArray<T extends Unit>(input: HexArray, CLS: BytesConstructable<T>) {
        const bytes = CLS.alloc(input.length);
        for (const [i, item] of input.entries()) {
            bytes[i] = parseInt(item, 16);
        }
        return bytes;
    }

    static fromHex<T extends Unit>(input: string, CLS: BytesConstructable<T>) {
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



export class Unit {
    
    readonly buffer: Buffer;

    protected constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    public static alloc(length: number) {
        return new Unit(Buffer.alloc(length));
    }

    public static from(array: BufferConstructorLikes) {
        Buffer.from(array)
    }

}

export class Unit256 extends Unit {

    public static alloc() {
        return new Unit256(Buffer.alloc(32));
    }

}


class Int64 {
    readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    public static fromNumber(input: number) {
        const int64 = new Int64(Buffer.alloc(8));
        int64.add(input);
        return int64;
    }

    public add(value: number) {
        let carry = value;
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] + carry;
            this.buffer[i] = sum % 256;
            carry = Math.floor(sum / 256);
        }
    }

}

function b(a: ArrayLike<number>) {

}

b(new Uint8Array())
