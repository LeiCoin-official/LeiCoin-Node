import { AbstractBinaryMap } from "low-level";
import { type Uint, Uint32 } from "low-level";
import { Deferred } from "../utils/deferred.js";
import type { LNAbstractMsgBody, LNMsgID } from "./messaging/abstractMsg.js";
import { LNRequestMsg } from "./messaging/netPackets.js";

class LNActiveRequest {

    readonly expectedTypes: LNMsgID[];

    constructor(
        readonly requestID: Uint32,
        expectedTypes: LNMsgID[] | LNMsgID,
        protected readonly result = new Deferred<LNAbstractMsgBody>()
    ) {
        this.expectedTypes = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
    }

    static fromRequestMsg(msg: LNRequestMsg) {
        return new LNActiveRequest(
            msg.requestID,
            msg.type
        );
    }

    public resolve(data: LNAbstractMsgBody) {
        /**
         * @todo Check if the data is of the expected type and more error handling
         * @todo Implement a timeout for the request
         */
        this.result.resolve(data);
    }

    public awaitResult() {
        return this.result.awaitResult();
    }

    public toCompactData() {
        return new LNActiveRequestCompactData(this.expectedTypes, this.result);
    }

}

class LNActiveRequestCompactData {
    constructor(
        readonly expectedTypes: LNMsgID[],
        readonly result: Deferred<LNAbstractMsgBody>
    ) {}
}


export class LNActiveRequests extends AbstractBinaryMap<Uint32, LNActiveRequestCompactData> {
    constructor(entries?: readonly (readonly [Uint32, LNActiveRequestCompactData])[]) {
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

    // @ts-ignore
    public get(id: Uint32) {
        const data = super.get(id);
        if (!data) return;
        return new LNActiveRequest(id, data.expectedTypes, data.result);
    }

    public has(id: Uint32) {
        return super.has(id);
    }
}

