
type New<T> = new(buffer: Buffer) => T;

interface FixedUintConstructable<T> extends New<T>  {
    byteLength: number;
    alloc(): T;
}

interface UintConstructable<T> extends New<T> {
    alloc(length?: number): T;
    byteLength?: number;
}


type WithString = {[Symbol.toPrimitive](hint: "string"): string} | WithImplicitCoercion<string>;
type WithArrayBuffer = WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>;

type ByteArray = readonly number[] | Uint8Array;

export type NumberLike = Uint | number;
export type BinLike = Uint | Buffer;


class UintUtils {

    static correctByteLengthBuffer(buffer: Buffer, correctByteLength: number) {
        if (buffer.byteLength === correctByteLength) {
            return buffer;
        }
        const newBuffer = Buffer.alloc(correctByteLength);
        newBuffer.set(buffer, correctByteLength - buffer.byteLength);
        return newBuffer;
    }

    static correctByteLengthUint<T>(CLS: New<T>, uint: Uint, correctByteLength: number) {
        return new CLS(this.correctByteLengthBuffer(uint.getRaw(), correctByteLength));
    }

}

export class Uint {
    
    protected readonly buffer: Buffer;

    constructor(input: Uint | Buffer);
    constructor(input: Uint & Buffer) {
        this.buffer = input.getRaw ? input.getRaw() : input;
    }

    public static create<T>(this: New<T>, input: Uint | Buffer): T;
    public static create(input: Uint & Buffer) {
        return new this(input);
    }

    public static alloc<T>(this: New<T>, length: number): T;
    public static alloc(length: number) {
        return new this(Buffer.alloc(length));
    }

    public static empty<T>(this: New<T>): T;
    public static empty(this: UintConstructable<Uint>) {
        return this.alloc(this.byteLength || 0);
    }

    public static from<T>(this: New<T>, arrayBuffer: WithArrayBuffer, byteOffset?: number, length?: number): T;
    public static from<T>(this: New<T>, data: WithImplicitCoercion<ByteArray | string>): T;
    public static from<T>(this: New<T>, str: WithString, encoding?: BufferEncoding): T;
    public static from<T>(this: New<T>, number: number, length?: number): T;
    public static from(this: UintConstructable<Uint>, input: any, arg2?: any, arg3?: any) {
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

    /** @deprecated Use {@link Uint.from}(string) instead */
    public static fromHex<T>(this: New<T>, hex: string): T;
    /** @deprecated Use {@link Uint.from}(string) instead */
    public static fromHex(hex: string) {
        return this.from(hex, "hex");
    }

    public static concat<T>(this: New<T>, list: (Uint | Buffer)[], totalLength?: number): T;
    public static concat(list: (Uint & Buffer)[], totalLength?: number) {
        return new this(Buffer.concat(
            list.map((item) => {
                return item.getRaw ? item.getRaw() : item;
            }), totalLength
        ));
    }


    public toHex() {
        return this.buffer.toString("hex")
    }

    public toInt() {
        try {
            return this.buffer.readUintBE(0, this.buffer.byteLength);
        } catch {
            return 0;
        }
    }

    public getRaw() {
        return this.buffer;
    }

    public getLen(): number;
    public getLen(enc: "uint"): Uint;
    public getLen(enc?: "number" | "uint") {
        return enc === "uint" ? Uint.from(this.buffer.byteLength) : this.buffer.byteLength;
    }

    public set(list: ArrayLike<number> | Uint, offset?: number): void;
    public set(list: ArrayLike<number> & Uint, offset?: number) {
        this.buffer.set((list.getRaw ? list.getRaw() : list), offset);
    }

    public slice(start?: number, end?: number) {
        return new Uint(this.buffer.subarray(start, end));
    }


    public add(value: NumberLike) {
        if (typeof value === "object") {
            this.addUint(value);
        } else if (typeof value === "number") {
            this.addNumber(value);
        }
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
                this.buffer.writeUint32BE(sum % 4294967296, i);
            } else {
                this.buffer.writeUint32BE((sum % 4294967296) + 4294967296, i)
            }
            value = Math.floor(sum / 4294967296);
        }
    }

    public toShortUint() {
        for (let i = 0; i < this.buffer.byteLength; i++) {
            if (this.buffer[i] !== 0) {
                return this.slice(i);
            }
        }
        return Uint.empty();
    }

    public toBigInt() {
        return this.buffer.readBigInt64BE();
    }

}

export class Uint256 extends Uint64 {
    public static readonly byteLength: number = 32;
}

export class Uint8 extends FixedUint {
    public static readonly byteLength: number = 1;
}

