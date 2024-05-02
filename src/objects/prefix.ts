import { Uint8 } from "../utils/binary.js";

class UintLockedErr extends Error {
    name = "UintLockedError";
    message = "Prefix Uints are Locked and cannot be modified";
}

function lockedErr(...args: any[]): any {
    return new UintLockedErr();
}

class Prefix extends Uint8 {

    public static readonly V_00 = Prefix.from("00");

    // Standard Address Prefix: 00
    public static readonly A_00 = Prefix.from("00");
    // Smart Contract Address Prefix: 0c
    public static readonly A_0c = Prefix.from("0c");
    // Validator Address Prefix: 0e
    public static readonly A_0e = Prefix.from("0e");

    public set = lockedErr;
    public slice = lockedErr;
    public add = lockedErr;
    public sub = lockedErr;

}

export { Prefix as PX };
