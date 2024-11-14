import { type Uint } from "low-level";
import cli from "../../cli/cli.js";
import { type DataEncoder } from "../../encoding/binaryEncoders.js";
import ObjectEncoding from "../../encoding/objects.js";
import { LockedUint } from "../../objects/prefix.js";
import { type Dict } from "../../utils/dataUtils.js";
import { type LNBasicMsgHandler } from "./abstractMsgHandler.js";

/**
 * Stores the message types used in the LeiCoin network
 * The IDs a deffined hashing the message type name and selecting the last 2 bytes
 */
export class LNMsgType extends LockedUint {
    public static readonly byteLength = 2;
}


export abstract class LNAbstractMsgBody {

    public getTypeID() {
        return (this.constructor as LNMsgInfo).TYPE;
    }

    public getHandler() {
        return (this.constructor as LNMsgInfo).Handler;
    }

    
    public encodeToHex() {
        return ObjectEncoding.encode(this, (this.constructor as typeof LNAbstractMsgBody).encodingSettings, false).data;
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

    protected static fromDict(obj: Dict<any>): LNAbstractMsgBody {
        throw new Error("Method not implemented.");
    }

    protected static readonly encodingSettings: readonly DataEncoder[] = [];
}


export interface LNMsgBodyConstructor<T extends LNAbstractMsgBody = LNAbstractMsgBody> {
    new(...args: any[]): T;
    fromDecodedHex(hexData: Uint): T | null;
}

export interface LNMsgInfo extends LNMsgBodyConstructor {
    readonly TYPE: LNMsgType;
    readonly Handler: LNBasicMsgHandler;
}
