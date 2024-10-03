import { AbstractBinaryMap } from "../binary/map.js";
import { type Uint, Uint32 } from "../binary/uint.js";
import { Deferred } from "../utils/deferred.js";
import { type LNMsgType } from "./messaging/messageTypes.js";
import { LNRequestMsg } from "./messaging/netPackets.js";

class LNActiveRequest {

    readonly expectedTypes: LNMsgType[];

    constructor(
        readonly requestID: Uint32,
        expectedTypes: LNMsgType[] | LNMsgType,
        readonly result: Deferred<Uint> = new Deferred()
    ) {
        this.expectedTypes = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
    }

    static fromRequestMsg(msg: LNRequestMsg) {
        return new LNActiveRequest(
            msg.requestID,
            msg.type
        );
    }

    public resolve(data: Uint) {
        /**
         * @todo Check if the data is of the expected type and more error handling
         * @todo Implement a timeout for the request
         */
        this.result.resolve(data);
    }

    public toCompactData() {
        return new LNActiveRequestCompactData(this.expectedTypes, this.result);
    }

}

class LNActiveRequestCompactData {
    constructor(
        readonly expectedTypes: LNMsgType[],
        readonly result: Deferred<Uint>
    ) {}
}


export class LNActiveRequests extends AbstractBinaryMap<Uint32, LNActiveRequestCompactData> {
    constructor(entries?: readonly (readonly [Uint32, LNActiveRequest])[]) {
        super(Uint32, entries);
    }

    public get size() { return super.size; }

    public add(req: LNRequestMsg | LNActiveRequest): LNActiveRequest {
        if (req instanceof LNRequestMsg) {
            return this.add(LNActiveRequest.fromRequestMsg(req));
        }

        super.set(req.requestID, req.toCompactData());
        return req;
    }

    public get(id: Uint32) {
        const data = super.get(id);
        return new LNActiveRequest(id, data.expectedTypes, data.result);
    }
}

