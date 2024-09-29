import { Uint32, type Uint } from "../../binary/uint.js";
import cli from "../../cli/cli.js";
import { BE, type DataEncoder } from "../../encoding/binaryEncoders.js";
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


abstract class LNAbstractMsg {
    public encodeToHex() {
        return ObjectEncoding.encode(this, (this.constructor as typeof LNAbstractMsg).encodingSettings, false).data;
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

    protected static fromDict(obj: Dict<any>): LNAbstractMsg {
        throw new Error("Method not implemented.");
    }

    protected static readonly encodingSettings: readonly DataEncoder[] = [];
}


export class LNStandartMsg extends LNAbstractMsg {
    constructor(
        readonly type: LNMsgType,
        readonly data: LNMsgData
    ) {super()}

    protected static fromDict(obj: Dict<any>) {
        return new LNStandartMsg(
            obj.type,
            obj.data
        );
    }

    protected static readonly encodingSettings: readonly DataEncoder[] = [
        BE(LNMsgType, "type"),
        BE(LNMsgData, "data")
    ];
}

export class LNRequestMsg extends LNStandartMsg {

    constructor(
        type: LNMsgType,
        requestID: Uint32,
        data: LNMsgData,
    ) {
        super(type, data);
    }

    protected static fromDict(obj: Dict<any>) {
        return new LNRequestMsg(
            obj.type,
            obj.requestID,
            obj.data
        );
    }

    protected static readonly encodingSettings: readonly DataEncoder[] = [
        BE(LNMsgType, "type"),
        BE(Uint32, "requestID"),
        BE(LNMsgData, "data")
    ];

}


export abstract class LNMsgData extends LNAbstractMsg {
    static readonly type: LNMsgType;

    get type() {
        return (this.constructor as typeof LNMsgData).type;
    }
}

export interface LNMsgDataConstructor {
    new(...args: any[]): LNMsgData;
    fromDecodedHex(hexData: Uint): LNMsgData | null;
}




