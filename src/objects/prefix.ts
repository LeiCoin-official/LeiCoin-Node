import { Uint } from "../binary/uint.js";

class PrefixConstructError extends Error {
    name = "PrefixConstructError";
    message = "Prefix Uints can only be constructed from two digit Strings";
}

class PrefixLockedError extends Error {
    name = "PrefixLockedError";
    message = "Prefix Uints are Locked and cannot be modified";
};

function constructErr(): any {
    throw new PrefixConstructError();
}

function lockedErr(...args: any[]): any {
    throw new PrefixLockedError();
}

export class LockedUint extends Uint {
    public static readonly byteLength: number;

    public static from<T>(this: new(buffer: Buffer) => T, hexType: string): T;
    /** @deprecated If you don't use {@link Prefix.from}(hexType: string) instead, an error will occur! */
    public static from(...args: any[]): any;
    public static from(input: string) {
        if (typeof input === "string" && input.length === this.byteLength * 2) {
            return new this(Buffer.from(input, "hex"));
        }
        constructErr();
    }

    protected static _from(input: string) {}

    /** @deprecated Don't try to construct a Prefix with alloc(), an error will occur! */
    public static alloc(): any {constructErr()};
    /** @deprecated Don't try to construct a Prefix with empty(), an error will occur! */
    public static empty(): any {constructErr()};

    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public set(): any {lockedErr()};

    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public appendData(): any {lockedErr()};

    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public iadd(): any {lockedErr()};
    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public add(): any {lockedErr()};

    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public isub() {lockedErr()};
    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public sub(): any {lockedErr()};

    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public idiv(): any {lockedErr()};
    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public div(): any {lockedErr()};
    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public mod(): any {lockedErr()};

}

class Prefix extends LockedUint {
    public static readonly byteLength = 1;

    // Prefix vor version 00
    static readonly V_00 = Prefix.from("00");

    // Meta Data Prefix
    static readonly META = Prefix.from("ff");

    // Standard Address Prefix: 00
    static readonly A_00 = Prefix.from("00");

    // Smart Contract Address Prefix: 0c
    static readonly A_0c = Prefix.from("0c");

    // Node Address Prefix: 0d
    static readonly A_0d = Prefix.from("0d");

    // Minter Address Prefix: 0e
    static readonly A_0e = Prefix.from("0e");
    
}

export { Prefix as PX };
