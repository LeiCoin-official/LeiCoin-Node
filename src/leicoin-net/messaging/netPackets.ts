import { type Uint, Uint32 } from "low-level";
import cli from "../../cli/cli.js";
import LCrypt from "../../crypto";
import { BE, type DataEncoder } from "../../encoding/binaryEncoders";
import ObjectEncoding from "../../encoding/objects.js";
import { MessageRouter } from "./index.js";
import { type LNAbstractMsgBody, type LNMsgBodyConstructor, LNMsgType } from "./messageTypes.js";


export class LNStandartMsg<T extends LNAbstractMsgBody = LNAbstractMsgBody> {

    readonly type: LNMsgType;

    constructor(readonly data: T) {
        this.type = data.getTypeID();
    }

    public encodeToHex() {
        return ObjectEncoding.encode(
            this,
            (this.constructor as typeof LNStandartMsg).getEncodingSettings(
                (this.data.constructor as LNMsgBodyConstructor<T>)
            ),
            false
        ).data;
    }

    static fromDecodedHex<T extends LNAbstractMsgBody, CT extends LNStandartMsg<T>>(
        this: new(data: T) => CT,
        hexData: Uint,
        CLS: new (...args: any[]) => T
    ): CT | null;
    static fromDecodedHex<CT extends LNStandartMsg<LNAbstractMsgBody>>(
        this: new(data: LNAbstractMsgBody) => CT,
        hexData: Uint,
        CLS?: "auto"
    ): CT | null;

    static fromDecodedHex(hexData: Uint, arg1: LNMsgBodyConstructor | any = "auto") {
        try {
            const autoTypeChecking = arg1 === "auto";
            const CLS: LNMsgBodyConstructor | undefined = autoTypeChecking ? MessageRouter.getMsgInfo(new LNMsgType(hexData.slice(0, 2))) : arg1;
            
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

    protected static fromDict<T extends LNAbstractMsgBody>(obj: Dict<any>) {
        return new LNStandartMsg(obj.data as T);
    }

    protected static readonly baseEncodingSettings: readonly DataEncoder[] = [
        BE(LNMsgType, "type"),
    ];

    protected static getEncodingSettings<T extends LNMsgBodyConstructor>(CLS: T): readonly DataEncoder[] {
        return [
            ...this.baseEncodingSettings,
            BE.Object("data", CLS)
        ]
    }
}


export class LNRequestMsg<T extends LNAbstractMsgBody = LNAbstractMsgBody> extends LNStandartMsg<T> {

    constructor(readonly requestID: Uint32, data: T) {
        super(data);
    }

    static create<T extends LNAbstractMsgBody>(data: T) {
        return new LNRequestMsg(new Uint32(LCrypt.randomBytes(4)), data);
    }

    protected static fromDict(obj: Dict<any>) {
        return new LNRequestMsg(obj.requestID, obj.data);
    }

    protected static readonly baseEncodingSettings: readonly DataEncoder[] = [
        BE(LNMsgType, "type"),
        BE(Uint32, "requestID"),
    ];

}


export class LNBroadcastMsg<T extends LNAbstractMsgBody = LNAbstractMsgBody> extends LNStandartMsg<T> {
    constructor(data: T) {
        super(data);
    }

    protected static fromDict(obj: Dict<any>) {
        return new LNBroadcastMsg(obj.data);
    }
}
