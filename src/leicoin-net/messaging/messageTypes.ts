import { Uint32, type Uint } from "../../binary/uint.js";
import cli from "../../cli/cli.js";
import { BE, type DataEncoder } from "../../encoding/binaryEncoders.js";
import ObjectEncoding from "../../encoding/objects.js";
import { LockedUint } from "../../objects/prefix.js";
import { Dict } from "../../utils/dataUtils.js";
import { BasicMessagingChannel } from "./abstractChannel.js";

/**
 * Stores the message types used in the LeiCoin network
 * The IDs a deffined hashing the message type name and selecting the last 2 bytes
 */
export class LNMsgType extends LockedUint {
    public static readonly byteLength = 2;
}

export namespace LNMsgType {
    export const STATUS = LNMsgType.from("1761");
    
    export const CHALLENGE = LNMsgType.from("77a9");

    export const NEW_BLOCK = LNMsgType.from("2096");
    export const GET_BLOCKS = LNMsgType.from("d372");

    export const NEW_TRANSACTION = LNMsgType.from("8356");
    export const GET_TRANSACTIONS = LNMsgType.from("09aa");

    export const GET_CHAINSTATE = LNMsgType.from("1f76");
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
    static readonly TYPE: LNMsgType;
    static readonly Handler: BasicMessagingChannel;

    get type() {
        return (this.constructor as typeof LNMsgData).TYPE;
    }
}

export interface LNMsgDataConstructor {
    new(...args: any[]): LNMsgData;
    fromDecodedHex(hexData: Uint): LNMsgData | null;
}




