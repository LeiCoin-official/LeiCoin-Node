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

type New<T> = new(buffer: Buffer) => T;
interface UintConstructable<T> extends New<T> {
    alloc(length?: number): T;
}

interface FixedUintConstructable<T> extends New<T> {
    byteLength: number;
    alloc(): T;
}

type ByteArray = readonly number[] | Uint8Array;

type WithString = {[Symbol.toPrimitive](hint: "string"): string} | WithImplicitCoercion<string>;
type WithArrayBuffer = WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>;

class BaseUint {
    
    protected readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    public static alloc<T>(this: New<T>, length: number): T;
    public static alloc(length: number) {
        return new this(Buffer.alloc(length));
    }

    public static from<T>(this: New<T>, arrayBuffer: WithArrayBuffer, byteOffset?: number, length?: number): T;
    public static from<T>(this: New<T>, data: WithImplicitCoercion<ByteArray | string>): T;
    public static from<T>(this: New<T>, str: WithString, encoding?: BufferEncoding): T;
    public static from<T>(this: New<T>, number: bigint | string | Uint64): T;
    public static from(arg1: any, arg2?: any, arg3?: any) { return this._from(arg1, arg2, arg3); };

    protected static _from(input: any, arg2?: any, arg3?: any) {
        return new this(Buffer.from(input, arg2, arg3));
    }

}

class FixedBaseUint extends BaseUint {

    public static readonly byteLength: number;

    public static alloc<T>(this: New<T>): T;
    public static alloc() {
        return new this(Buffer.alloc(this.byteLength));
    }

    protected static _from(input: any, arg2?: any, arg3?: any) {
        return new this(Buffer.from(input, arg2, arg3));
    }

}

export class Uint extends BaseUint {}

export class Uint256 extends FixedBaseUint {

}


class Uint64 extends FixedBaseUint {

    public static readonly byteLength = 8;

    public static fromNumber(input: number) {
        const int64 = new this(Buffer.alloc(8));
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

const myVar = Uint64.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
console.log(myVar);
// @ts-ignore
console.log(BigInt("0x" + myVar.buffer.toString("hex")));
