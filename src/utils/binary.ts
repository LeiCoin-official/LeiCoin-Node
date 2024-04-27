
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

type NumberLike = Uint | number;

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

class UintUtils {

    static correctByteLengthBuffer(buffer: Buffer, correctByteLength: number) {
        if (buffer.byteLength === correctByteLength) {
            return buffer;
        }
        const newBuffer = Buffer.alloc(correctByteLength);
        newBuffer.set(buffer, correctByteLength - buffer.byteLength);
        return newBuffer;
    }

    static correctByteLengthUint<T>(CLS: New<T>, unit: Uint, correctByteLength: number) {
        return new CLS(this.correctByteLengthBuffer(unit.getRaw(), correctByteLength));
    }

}

export class Uint {
    
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
    public static from<T>(this: New<T>, number: number, length?: number): T;
    public static from(this: BasicUintConstructable<Uint>, input: any, arg2?: any, arg3?: any) {
        let uint: Uint;
        let buffer: Buffer;
        if (typeof input === "number") {
            uint = this.alloc(arg2 || (Math.floor(input.toString(16).length / 2) + 1));
            uint.add(input);
            return uint;
        } else if (typeof input === "string" && arg2 === undefined) {
            buffer = Buffer.from(input, "hex");
        } else {
            buffer = Buffer.from(input, arg2, arg3);
        }
        return new this(buffer);
    }

    public static fromHex<T>(this: New<T>, hex: string): T;
    public static fromHex(hex: string) {
        return this.from(hex, "hex");
    }

    public static concat<T>(this: New<T>, list: readonly Uint[], totalLength?: number): T;
    public static concat<T>(list: Uint[], totalLength?: number) {
        return new this(Buffer.concat(
            list.map((item) => {
                return item.getRaw();
            }), totalLength
        ));
    }


    public toHex() {
        return this.buffer.toString("hex")
    }

    public getRaw() {
        return this.buffer;
    }


    public set(array: ArrayLike<number>, offset?: number) {
        this.buffer.set(array, offset);
    }

    public slice(start?: number, end?: number) {
        return new Uint(this.buffer.subarray());
    }


    public add(value: NumberLike) {
        if (typeof value === "object") {
            this.addUint(value);
        } else if (typeof value === "number") {
            this.addNumber(value);
        }
        return true;
    }

    public sub(value: NumberLike) {
        if (typeof value === "object") {
            this.subUint(value);
        } else if (typeof value === "number") {
            this.addNumber(value * -1);
        }
    }

    public gt(value: NumberLike) {
        return this.compare(value) === 1;
    }

    public gte(value: NumberLike) {
        return this.compare(value) !== -1;
    }

    public lt(value: NumberLike) {
        return this.compare(value) === -1;
    }

    public lte(value: NumberLike) {
        return this.compare(value) !== 1;
    }

    public eq(value: NumberLike) {
        return this.compare(value) === 0;
    }

    public eqn(value: NumberLike) {
        return this.compare(value) !== 0;
    }

    protected addUint(value: Uint) {
        if (this.buffer.byteLength !== value.buffer.byteLength) {
            // @ts-ignore
            value = UintUtils.correctByteLengthUint(this.constructor, value, this.buffer.byteLength)
        }
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
            if (sum >= 0) {
                this.buffer[i] = sum % 256;
            } else {
                this.buffer[i] = (sum % 256) + 256;
            }
            value = Math.floor(sum / 256);
        }
    }


    protected subUint(value: Uint) {
        if (this.buffer.byteLength !== value.buffer.byteLength) {
            // @ts-ignore
            value = UintUtils.correctByteLengthUint(this.constructor, value, this.buffer.byteLength)
        }
        let carry = 0;
        for (let i = this.buffer.byteLength - 1; i >= 0; i--) {
            const sum = this.buffer[i] - value.buffer[i] + carry;
            if (sum >= 0) {
                this.buffer[i] = sum % 256;
            } else {
                this.buffer[i] = (sum % 256) + 256;
            }
            carry = Math.floor(sum / 256);
        }
    }


    protected compare(value: NumberLike) {
        if (typeof value === "number") {
            value = Uint.from(value, this.buffer.byteLength);
        } else if (this.buffer.byteLength !== value.buffer.byteLength) {
            value = UintUtils.correctByteLengthUint(Uint, value, this.buffer.byteLength)
        }
        return this.buffer.compare(value.buffer)
    }

}

export class FixedUint extends Uint {

    public static readonly byteLength: number;

    constructor(buffer: Buffer) {
        super(buffer);
    }

    public static alloc<T>(this: New<T>): T;
    public static alloc() {
        return new this(Buffer.alloc(this.byteLength));
    }

    public static from<T>(this: New<T>, arrayBuffer: WithArrayBuffer, byteOffset?: number, length?: number): T;
    public static from<T>(this: New<T>, data: WithImplicitCoercion<ByteArray | string>): T;
    public static from<T>(this: New<T>, str: WithString, encoding?: BufferEncoding): T;
    public static from<T>(this: New<T>, number: number): T;
    public static from(this: FixedUintConstructable<FixedUint>, input: any, arg2?: any, arg3?: any) {
        let uint: FixedUint;
        let buffer: Buffer;
        if (typeof input === "number") {
            uint = this.alloc();
            uint.add(input);
            return uint;
        } else if (typeof input === "string" && arg2 === undefined) {
            buffer = Buffer.from(input, "hex");
        } else {
            buffer = Buffer.from(input, arg2, arg3);
        }
        return new this(UintUtils.correctByteLengthBuffer(buffer, this.byteLength));
    }

}

export class Uint64 extends FixedUint {

    public static readonly byteLength: number = 8;
    
    protected addNumber(value: number) {
        for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
            const sum = this.buffer.readUint32BE(i) + value;
            if (sum >= 0) {
                this.buffer.writeUInt32BE(sum % 4294967296, i);
            } else {
                this.buffer.writeUInt32BE((sum % 4294967296) + 4294967296, i)
            }
            value = Math.floor(sum / 4294967296);
        }
    }

}

export class Uint256 extends Uint64 {
    public static readonly byteLength: number = 32;
}

export class Uint8 extends FixedUint {
    public static readonly byteLength: number = 1;
}

