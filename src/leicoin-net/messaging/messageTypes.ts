import { Uint32, type Uint } from "../../binary/uint.js";
import cli from "../../cli/cli.js";
import { BE, type DataEncoder } from "../../encoding/binaryEncoders.js";
import ObjectEncoding from "../../encoding/objects.js";
import { LockedUint } from "../../objects/prefix.js";
import { type Dict } from "../../utils/dataUtils.js";
import { type LNBasicMsgHandler } from "./abstractChannel.js";

/**
 * Stores the message types used in the LeiCoin network
 * The IDs a deffined hashing the message type name and selecting the last 2 bytes
 */
export class LNMsgType extends LockedUint {
    public static readonly byteLength = 2;
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


interface LNMsgContentConstructor<T extends LNMsgContent = LNMsgContent> {
    new(...args: any[]): T;
    fromDecodedHex(hexData: Uint): T | null;
}

export interface LNMsgInfo extends LNMsgContentConstructor {
    readonly TYPE: LNMsgType;
    readonly Handler: LNBasicMsgHandler;
}

export abstract class LNMsgContent extends LNAbstractMsg {}


export class LNStandartMsg<T extends LNMsgContent> {
    constructor(
        readonly type: LNMsgType,
        readonly data: T
    ) {}

    public encodeToHex() {
        return ObjectEncoding.encode(
            this,
            (this.constructor as typeof LNStandartMsg).getEncodingSettings(
                (this.data.constructor as LNMsgContentConstructor<T>)
            ),
            false
        ).data;
    }

    static fromDecodedHex<T extends LNMsgContent, CT extends LNStandartMsg<T>>(
        this: new(type: LNMsgType, data: T) => CT,
        hexData: Uint,
        CLS: new (...args: any[]) => T
    ): CT | null;
    static fromDecodedHex<CT extends LNStandartMsg<LNMsgContent>>(
        this: new(type: LNMsgType, data: LNMsgContent) => CT,
        hexData: Uint,
        CLS?: "auto"
    ): CT | null;

    static fromDecodedHex(hexData: Uint, CLS: LNMsgContentConstructor | any = "auto") {
        try {
            const autoTypeChecking = CLS === "auto";
            

            const data = ObjectEncoding.decode(hexData, this.getEncodingSettings(CLS), autoTypeChecking).data;
            if (data) {
                return this.fromDict<typeof CLS.prototype>(data);
            }
        } catch (err: any) {
            cli.data.error(`Error loading ${this.name} from Decoded Hex: ${err.stack}`);
        }
        return null;
    }

    protected static fromDict<T extends LNMsgContent>(obj: Dict<any>) {
        return new LNStandartMsg(
            obj.type,
            obj.data as T
        );
    }

    protected static readonly baseEncodingSettings: readonly DataEncoder[] = [
        BE(LNMsgType, "type"),
    ];

    protected static getEncodingSettings<T extends LNMsgContentConstructor>(CLS: T): readonly DataEncoder[] {
        return [
            ...this.baseEncodingSettings,
            BE.Object("data", CLS)
        ]
    }
}

export class LNRequestMsg<T extends LNMsgContent> extends LNStandartMsg<T> {

    constructor(
        type: LNMsgType,
        readonly requestID: Uint32,
        data: T,
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

    protected static readonly baseEncodingSettings: readonly DataEncoder[] = [
        BE(LNMsgType, "type"),
        BE(Uint32, "requestID"),
    ];

}

