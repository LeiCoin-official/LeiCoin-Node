import { Uint32, type Uint } from "../../binary/uint.js";
import cli from "../../cli/cli.js";
import { type DataEncoder } from "../../encoding/binaryEncoders.js";
import ObjectEncoding from "../../encoding/objects.js";
import { LockedUint } from "../../objects/prefix.js";
import { Dict } from "../../utils/dataUtils.js";

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

export abstract class LNMsgObject {
    static readonly type: LNMsgType;

    get type() {
        return (this.constructor as typeof LNMsgObject).type;
    }

    public encodeToHex() {
        return ObjectEncoding.encode(this, (this.constructor as typeof LNMsgObject).encodingSettings, false).data;
    }

    static fromDecodedHex<T>(this: T, hexData: Uint): T | null;
    static fromDecodedHex(hexData: Uint) {
        try {
            const data = ObjectEncoding.decode(hexData, this.encodingSettings).data;
            if (data) {
                return this.fromDict(data);
            }
        } catch (err: any) {
            cli.data.error(`Error loading ${this.name} from Decoded Hex: ${err.stack}`);
        }
        return null;
    }

    protected static fromDict(obj: Dict<any>): LNMsgObject {
        throw new Error("Method not implemented.");
    }

    protected static readonly encodingSettings: readonly DataEncoder[] = [];
}

export abstract class LNRequestMsg extends LNMsgObject {

    constructor(readonly requestID: Uint32) {
        super()
    }

    static isRequest(msg: LNMsgObject) {
        if ((msg as LNRequestMsg).requestID) {
            return true;
        }
        return false;
    }

    protected static readonly encodingSettings: readonly DataEncoder[] = [];

}

export interface LNMsgObjectConstructor {
    new(...args: any[]): LNMsgObject;
    fromDecodedHex(hexData: Uint): LNMsgObject | null;
}