import { type Uint, Uint32 } from "../../binary/uint.js";
import cli from "../../cli/cli.js";
import LCrypt from "../../crypto";
import { BE, type DataEncoder } from "../../encoding/binaryEncoders";
import ObjectEncoding from "../../encoding/objects.js";
import { MessageRouter } from "./index.js";
import { type LNMsgContent, type LNMsgContentConstructor, LNMsgType } from "./messageTypes.js";

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

    static fromDecodedHex(hexData: Uint, arg1: LNMsgContentConstructor | any = "auto") {
        try {
            const autoTypeChecking = arg1 === "auto";
            const CLS: LNMsgContentConstructor | undefined = autoTypeChecking ? MessageRouter.getMsgInfo(new LNMsgType(hexData.slice(0, 2))) : arg1;
            
            if (!CLS) return null;

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

export class LNRequestMsg<T extends LNMsgContent = LNMsgContent> extends LNStandartMsg<T> {

    constructor(
        type: LNMsgType,
        readonly requestID: Uint32,
        data: T,
    ) {
        super(type, data);
    }

    static create<T extends LNMsgContent>(data: T) {
        return new LNRequestMsg(
            data.getTypeID(),
            new Uint32(LCrypt.randomBytes(4)),
            data
        );
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