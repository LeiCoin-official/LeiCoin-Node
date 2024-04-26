
type New<T> = new(buffer: Buffer) => T;

interface BasicUintConstructable<T> extends New<T> {
    alloc(length: number): T;
}

interface FixedUintConstructable<T> extends BasicUintConstructable<T> {
    byteLength: number;
    alloc(): T;
}

interface UintConstructable<T> extends BasicUintConstructable<T> {
    alloc(length?: number): T;
    byteLength?: number;
}

type ByteArray = readonly number[] | Uint8Array;

type WithString = {[Symbol.toPrimitive](hint: "string"): string} | WithImplicitCoercion<string>;
type WithArrayBuffer = WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>;

type NumberLike = BaseUint | number | bigint;

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
    public static from<T>(this: New<T>, number: BaseUint | number | bigint): T;
    public static from(this: UintConstructable<BaseUint>, input: any, arg2?: any, arg3?: any) {
        let unit: BaseUint;
        if (typeof input === "number" || typeof input === "bigint") {
            unit = this.alloc(this.byteLength || (Math.floor(input.toString(16).length / 2) + 1));
            unit.add(input);
            return unit;
        }
        return new this(Buffer.from(input, arg2, arg3));
    }


    public add(value: NumberLike) {
        if (typeof value === "object") {
            this.addUint(value);
        } else if (typeof value === "number") {
            this.addNumber(value);
        } else if (typeof value === "bigint") {
            this.addBigInt(value);
        }
    }

    public sub(value: NumberLike) {
        if (typeof value === "object") {
            this.subUint(value);
        } else if (typeof value === "number") {
            this.subNumber(value);
        } else if (typeof value === "bigint") {
            this.subBigInt(value);
        }
    }


    protected addUint(value: BaseUint) {
        let carry = 0;
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] + value.buffer[i] + carry;
            this.buffer[i] = sum % 256;
            carry = Math.floor(sum / 256);
        }
    }

    protected addNumber(value: number) {
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] + value;
            this.buffer[i] = sum % 256;
            value = Math.floor(sum / 256);
        }
    }

    protected addBigInt(value: bigint) {
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum: bigint = BigInt(this.buffer[i]) + value;
            this.buffer[i] = Number(sum % 256n);
            value = sum / 256n;
        }
    }


    protected subUint(value: BaseUint) {
        let carry = 0;
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] - value.buffer[i] - carry;
            this.buffer[i] = sum % 256;
            carry = Math.floor(sum / 256);
        }
    }

    protected subNumber(value: number) {
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] - value;
            this.buffer[i] = sum % 256;
            value = Math.floor(sum / 256);
        }
    }

    protected subBigInt(value: bigint) {
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum: bigint = BigInt(this.buffer[i]) - value;
            this.buffer[i] = Number(sum % 256n);
            value = sum / 256n;
        }
    }
    

    /*protected gtUint(value: BaseUint) {
        let carry = 0;
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] + value.buffer[i] + carry;
            this.buffer[i] = sum % 256;
            carry = Math.floor(sum / 256);
        }
    }

    protected gtNumber(value: number) {
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] + value;
            this.buffer[i] = sum % 256;
            value = Math.floor(sum / 256);
        }
    }

    protected gtBigInt(value: bigint) {
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum: bigint = BigInt(this.buffer[i]) + value;
            this.buffer[i] = Number(sum % 256n);
            value = sum / 256n;
        }
    }*/

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

}

export class Uint extends BaseUint {}

export class Uint256 extends FixedBaseUint {

}


export class Uint64 extends FixedBaseUint {

    public static readonly byteLength = 8;

    protected addNumber(value: number) {
        for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
            const sum = this.buffer.readUint32BE(i) + value;
            this.buffer.writeUInt32BE(sum % 4294967296, i);
            value = Math.floor(sum / 4294967296);
        }
    }

    protected addBigInt(value: bigint) {
        for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
            const sum: bigint = BigInt(this.buffer.readUint32BE(i)) + value;
            this.buffer.writeUInt32BE(Number(sum % 4294967296n), i);
            value = sum / 4294967296n;
        }
    }

    protected subNumber(value: number) {
        for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
            const sum = this.buffer.readUint32BE(i) - value;
            this.buffer.writeUInt32BE(sum % 4294967296, i);
            value = Math.floor(sum / 4294967296);
        }
    }

    protected subBigInt(value: bigint) {
        for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
            const sum: bigint = BigInt(this.buffer.readUint32BE(i)) - value;
            this.buffer.writeUInt32BE(Number(sum % 4294967296n), i);
            value = sum / 4294967296n;
        }
    }

}

