import { Uint, Uint256 } from "../utils/binary.js";

export class PublicKey extends Uint {
    public static readonly byteLength: number = 33;
}
export class PrivateKey extends Uint256 {}
