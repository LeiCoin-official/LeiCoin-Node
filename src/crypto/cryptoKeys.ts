import { FixedUint, Uint256 } from "../utils/binary.js";

export class PublicKey extends FixedUint {
    public static readonly byteLength = 33;
}
export class PrivateKey extends Uint256 {}
