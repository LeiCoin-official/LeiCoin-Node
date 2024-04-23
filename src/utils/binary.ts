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

class UintUtils {

    public static from(input: any, arg2?: any, arg3?: any) {
        let buffer: Buffer;
        if (typeof input === "number" || typeof input === "bigint") {
            buffer = Buffer.alloc(arg2);
            //buffer.wr
        } else {
            buffer = Buffer.from(input, arg2, arg3);
        }
        return buffer;
    }

}

class BaseUint {
    
    readonly buffer: Buffer;

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
    public static from<T>(this: New<T>, number: BaseUint | number | bigint, length: number): T;
    public static from(input: any, arg2?: any, arg3?: any) {
        return new this(UintUtils.from(input, arg2, arg3));
    }

    public add(value: BaseUint | number | bigint) {
        if (typeof value === "object") {
            let carry = 0;
            for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
                const sum = this.buffer[i] + value.buffer[i] + carry;
                this.buffer[i] = sum % 256;
                carry = Math.floor(sum / 256);
            }
        } else if (typeof value === "number") {
            for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
                const sum = this.buffer.readUint32BE(i) + value;
                this.buffer.writeUInt32BE(sum % 4294967296, i);
                value = Math.floor(sum / 4294967296);
            }
        } else if (typeof value === "bigint") {
            for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
                const sum: bigint = BigInt(this.buffer.readUint32BE(i)) + value;
                this.buffer.writeUInt32BE(Number(sum % 4294967296n), i);
                value = sum / 4294967296n;
            }
        }
    }

}

class FixedBaseUint extends BaseUint {

    public static readonly byteLength: number;

    constructor(buffer: Buffer) {
        super(buffer);
    }

    public static alloc<T>(this: New<T>): T;
    public static alloc() {
        return new this(Buffer.alloc(this.byteLength));
    }

    public static from<T>(this: New<T>, arrayBuffer: WithArrayBuffer, byteOffset?: number): T;
    public static from<T>(this: New<T>, data: WithImplicitCoercion<ByteArray | string>): T;
    public static from<T>(this: New<T>, str: WithString, encoding?: BufferEncoding): T;
    public static from<T>(this: New<T>, number: BaseUint | number | bigint): T;
    public static from(input: any, arg2?: any, arg3?: any) {
        return new this(UintUtils.from(input, arg2, arg3));
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

}

// @ts-ignore
const myVar = Uint64.from(1, 8);
console.log(myVar);
// @ts-ignore
console.log(BigInt("0x" + myVar.buffer.toString("hex")));
