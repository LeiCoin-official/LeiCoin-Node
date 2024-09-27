import { LockedUint } from "../../objects/prefix.js";

/**
 * Stores the message types used in the LeiCoin network
 * The IDs a deffined hashing the message type name and selecting the last 2 bytes
 */
export class LNMsgType extends LockedUint {
    public static readonly byteLength = 2;


    static readonly STATUS = LNMsgType.from("1761");
    
    static readonly CHALLENGE = LNMsgType.from("77a9");

    static readonly NEW_BLOCK = LNMsgType.from("2096");
    static readonly GET_BLOCKS = LNMsgType.from("d372");

    static readonly NEW_TRANSACTION = LNMsgType.from("8356");
    static readonly GET_TRANSACTIONS = LNMsgType.from("09aa");

    static readonly GET_CHAINSTATE = LNMsgType.from("1f76");

}

export abstract class MsgObject {
    
}

