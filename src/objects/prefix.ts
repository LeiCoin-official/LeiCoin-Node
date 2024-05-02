import { Uint8 } from "../utils/binary";

class Prefix extends Uint8 {

    public static readonly V_0 = Prefix.from(0x00);

    // Standard Address Prefix: 00
    public static readonly A_00 = Prefix.from(0x00);
    // Smart Contract Address Prefix: 0c
    public static readonly A_0c = Prefix.from(0x0c);
    // Validator Address Prefix: 0e
    public static readonly A_0e = Prefix.from(0x0e);

}

export { Prefix as PX };
