import { Uint8 } from "../utils/binary.js";

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


class Prefix extends Uint8 {

    // Prefix vor version 00
    public static readonly V_00 = Prefix.from("00");

    // Meta Data Prefix
    public static readonly META = Prefix.from("ff");

    // Standard Address Prefix: 00
    public static readonly A_00 = Prefix.from("00");
    // Smart Contract Address Prefix: 0c
    public static readonly A_0c = Prefix.from("0c");
    // Validator Address Prefix: 0e
    public static readonly A_0e = Prefix.from("0e");

    public static from(hexType: string): Prefix;
    /** @deprecated If you don't use {@link Prefix.from}(hexType: string) instead, an error will occur! */
    public static from(...args: any[]): any;
    public static from(input: string) {
        if (typeof input === "string" && input.length === 2) {
            return new Prefix(Buffer.from(input, "hex"));
        }
        constructErr();
    }

    /** @deprecated Don't try to construct a Prefix with alloc(), an error will occur! */
    public static alloc(): any {constructErr()};
    /** @deprecated Don't try to construct a Prefix with empty(), an error will occur! */
    public static empty(): any {constructErr()};

    /** @deprecated Don't try to modify a Prefix, an error will occur! */
    public set(): any {lockedErr()};

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

export { Prefix as PX };
