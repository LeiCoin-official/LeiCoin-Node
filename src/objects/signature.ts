import { FixedUint } from "../utils/binary";


export class Signature extends FixedUint {
    public static byteLength: number = 66;
}

export default Signature;
