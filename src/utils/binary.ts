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

interface UnitConstructable<T> {
    alloc(length?: number): T;
}


type HexArray = string[];
type NumberArray = bigint[] | number[] | Uint8Array;
type IOLikes = string | bigint | number | HexArray | NumberArray;
type InputLikes = IOLikes;
type IOEncodings = "hex" | "bigint" | "number" | "hexarray" | "intarray";

type ObjWithString = {[Symbol.toPrimitive](hint: "string"): string} | WithImplicitCoercion<string>;

type BufferConstructorLikes = WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer | ArrayLike<number> | string> | { [Symbol.toPrimitive](hint: "string"): string; };

Buffer.from(new ArrayBuffer(1))

class BinaryUtils {

    static from<T extends Unit>(input: string, CLS: UnitConstructable<T>) {

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

}

interface UnitConstructorFrom {
    (arrayBuffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>, byteOffset?: number, length?: number): Unit;
    (data: Uint8Array | readonly number[]): Unit;
    (data: WithImplicitCoercion<Uint8Array | readonly number[] | string>): Unit;
    (str: WithImplicitCoercion<string> | {[Symbol.toPrimitive](hint: "string"): string}, encoding?: BufferEncoding): Unit;
}

export class Unit {
    
    readonly buffer: Buffer;

    protected constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    public static alloc(length: number) {
        return new Unit(Buffer.alloc(length));
    }

    public static from: UnitConstructorFrom = (arg1: , arg2?: any, arg3?: any) => {
        return new Unit(Buffer.from(arg1, arg2, arg3));
    };

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
