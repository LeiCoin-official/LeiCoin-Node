
type New<T> = new(input: Uint | Buffer) => T;

export interface BasicUintConstructable<T extends Uint> extends New<T> {
    
    alloc(length?: number, fill?: string | Uint8Array | number): T;
    create(input: Buffer | Uint): T;

    from(arrayBuffer: WithArrayBuffer, byteOffset?: number, length?: number): T;
    from(data: WithImplicitCoercion<ByteArray | string>): T;
    from(str: WithString, encoding?: BufferEncoding): T;
    from(number: number, length?: number): T;

    byteLength?: number;
}

export interface FixedUintConstructable<T extends FixedUint> extends BasicUintConstructable<T> {
    byteLength: number;
    alloc(fill?: string | Uint8Array | number): T;
}


type WithString = {[Symbol.toPrimitive](hint: "string"): string} | WithImplicitCoercion<string>;
type WithArrayBuffer = WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>;

type ByteArray = readonly number[] | Uint8Array;

export type NumberLike = Uint | number;
export type BinLike = Uint | Buffer;


export class UintUtils {

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

    constructor(input: Uint | Buffer) {
        this.buffer = input instanceof Uint ? input.getRaw() : input;
    }

    public static create<T>(this: New<T>, input: Uint | Buffer): T;
    public static create(input: Uint | Buffer) {
        return new this(input);
    }

    public static alloc<T>(this: New<T>, length: number, fill?: string | Uint8Array | number): T;
    public static alloc(length: number, fill?: string | Uint8Array | number) {
        return new this(Buffer.alloc(length, fill));
    }

    public static empty<T>(this: New<T>): T;
    public static empty(this: BasicUintConstructable<Uint>) {
        return this.alloc(this.byteLength || 0);
    }

    public static from<T>(this: New<T>, arrayBuffer: WithArrayBuffer, byteOffset?: number, length?: number): T;
    public static from<T>(this: New<T>, data: WithImplicitCoercion<ByteArray | string>): T;
    public static from<T>(this: New<T>, str: WithString, encoding?: BufferEncoding): T;
    public static from<T>(this: New<T>, number: number, length?: number): T;
    public static from(this: BasicUintConstructable<Uint>, input: any, arg2?: any, arg3?: any) {
        let uint: Uint;
        let buffer: Buffer;
        if (typeof input === "number") {
            uint = this.alloc(arg2 || Math.ceil(input.toString(16).length / 2));
            uint.iadd(input);
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
    public static concat(list: (Uint | Buffer)[], totalLength?: number) {
        return new this(Buffer.concat(
            list.map((item) => {
                return item instanceof Uint ? item.getRaw() : item;
            }), totalLength
        ));
    }


    public clone() {
        return (this.constructor as BasicUintConstructable<this>).from(this.buffer);
    }

    public toHex() {
        return this.buffer.toString("hex");
    }

    public toString(encoding?: BufferEncoding) {
        return this.buffer.toString(encoding);
    }

    /** Supports only a number up to (2^48)-1 */
    public toInt() {
        if (this.buffer.byteLength > 6) {
            return this.buffer.readUintBE(this.buffer.byteLength - 6, 6);
        }
        return this.buffer.readUintBE(0, this.buffer.byteLength);
    }

    public getRaw() {
        return this.buffer;
    }

    public getAB() {
        return this.buffer.buffer.slice(
            this.buffer.byteOffset,
            this.buffer.byteOffset + this.buffer.byteLength
        );
    }

    public getLen(): number;
    public getLen(enc: "uint"): Uint;
    public getLen(enc?: "number" | "uint") {
        return enc === "uint" ? Uint.from(this.buffer.byteLength) : this.buffer.byteLength;
    }

    public set(list: ArrayLike<number> | Uint, offset?: number) {
        this.buffer.set((list instanceof Uint ? list.getRaw() : list), offset);
    }

    public appendData(data: Uint | Buffer) {
        return Uint.concat([this.buffer, data]);
    }

    public nci_slice<T>(CLS: New<T>, start?: number, end?: number) {
        return new CLS(this.buffer.subarray(start, end));   
    }

    public nci_split<T>(CLS: New<T>, afterBytes: number) {
        const list: T[] = [];
        for (let i = 0; i < this.buffer.byteLength; i += afterBytes) {
            list.push(this.nci_slice(CLS, i, i + afterBytes));
        }
        return list;
    }

    public slice(start?: number, end?: number) {return this.nci_slice(Uint, start, end)}
    public split(afterBytes: number) {return this.nci_split(Uint, afterBytes)}


    public iadd(value: NumberLike) {
        if (typeof value === "object") {
            return this.addUint(value);
        }
        return this.addNumber(value);
    }
    public add(value: NumberLike) {
        const clone = this.clone(); clone.iadd(value); return clone;
    }

    public isub(value: NumberLike) {
        if (typeof value === "object") {
            return this.subUint(value);
        }
        return this.addNumber(value * -1);
    }
    public sub(value: NumberLike) {
        const clone = this.clone(); clone.isub(value); return clone;
    }

    public idiv(value: NumberLike, returnRest = false) {
        if (typeof value === "object") {
            return this.divUint(value, returnRest);
        }
        return this.divNumber(value, returnRest);
    }
    public div(value: NumberLike) {
        const clone = this.clone(); clone.idiv(value); return clone;
    }

    public mod(value: NumberLike) {
        const clone = this.clone();
        return clone.idiv(value, true) as number;
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
            value = UintUtils.correctByteLengthUint(this.constructor as New<this>, value, this.buffer.byteLength)
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
        if (this.buffer.byteLength !== value.buffer.byteLength) { // @ts-ignore
            value = UintUtils.correctByteLengthUint(this.constructor as New<this>, value, this.buffer.byteLength)
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

    protected divUint(value: Uint, returnRest: boolean) {
        return this.divNumber(value.toInt(), returnRest);
    }
    protected divNumber(value: number, returnRest: boolean) {
        let carry = 0;
        for (let i = 0; i < this.buffer.byteLength; i++) {
            const dividend = this.buffer[i] + carry;
            this.buffer[i] = Math.floor(dividend / value);
            carry = (dividend % value) * 256;
        }
        if (returnRest) return (carry / 256);
    }


    protected compare(value: NumberLike) {
        if (typeof value === "number") {
            value = Uint.from(value, this.buffer.byteLength);
        } else if (this.buffer.byteLength !== value.buffer.byteLength) {
            value = UintUtils.correctByteLengthUint(Uint, value, this.buffer.byteLength)
        }
        return this.buffer.compare(value.buffer);
    }

    public get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

}

export class FixedUint extends Uint {

    public static readonly byteLength: number;

    constructor(buffer: Uint | Buffer) {
        super(buffer);
    }

    public static create<T>(this: New<T>, input: Uint | Buffer): T;
    public static create(input: Uint | Buffer) {
        return new this(UintUtils.correctByteLengthBuffer((input instanceof Uint ? input.getRaw() : input), this.byteLength));
    }

    public static alloc<T>(this: New<T>, fill?: string | Uint8Array | number): T;
    public static alloc(fill?: string | Uint8Array | number) {
        return new this(Buffer.alloc(this.byteLength, fill));
    }

    public static empty<T>(this: New<T>): T;
    public static empty(this: FixedUintConstructable<Uint>) {
        return this.alloc();
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
            uint.iadd(input);
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

    public static readonly byteLength = 8;
    
    protected addNumber(value: number) {
        for (let i = this.buffer.byteLength - 4; i >= 0; i -= 4) {
            const sum = this.buffer.readUint32BE(i) + value;
            if (sum >= 0) {
                this.buffer.writeUint32BE(sum % 4294967296, i);
            } else {
                this.buffer.writeUint32BE((sum % 4294967296) + 4294967296, i);
            }
            value = Math.floor(sum / 4294967296);
        }
    }

    protected divNumber(value: number, returnRest: boolean) {
        let carry = 0;
        for (let i = 0; i < this.buffer.byteLength; i += 4) {
            const dividend = this.buffer.readUint32BE(i) + carry;
            this.buffer.writeUint32BE(Math.floor(dividend / value), i);
            carry = (dividend % value) * 4294967296;
        }
        if (returnRest) return (carry / 4294967296);
    }

    public toShortUint() {
        for (let i = 0; i < this.buffer.byteLength; i++) {
            if (this.buffer[i] !== 0) {
                return this.slice(i);
            }
        }
        return Uint.from(0);
    }

    /** Supports only a number up to (2^64)-1 */
    public toBigInt() {
        return this.buffer.readBigUint64BE();
    }

}

// @ts-ignore
export class Uint96 extends Uint64 {
    public static readonly byteLength = 12;

    public toBigInt(): bigint {
        throw new Error("Method not implemented.");
    }
}

// @ts-ignore
export class Uint256 extends Uint64 {
    public static readonly byteLength = 32;

    public toBigInt(): bigint {
        throw new Error("Method not implemented.");
    }
}

export class Uint8 extends FixedUint {
    public static readonly byteLength = 1;
}

