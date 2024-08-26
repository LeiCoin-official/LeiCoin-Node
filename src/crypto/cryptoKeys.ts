import { FixedUint, Uint256 } from "../binary/uint.js";

export class PublicKey extends FixedUint {
    public static readonly byteLength = 33;
}
export class PrivateKey extends Uint256 {}
