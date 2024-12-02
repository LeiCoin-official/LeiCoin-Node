import { AbstractBinaryMap, Uint32 } from "low-level";
import { Deferred } from "../utils/deferred.js";
import type { LNAbstractMsgBody } from "./messaging/abstractMsg.js";
import { LNRequestMsg } from "./messaging/netPackets.js";
import Schedule from "../utils/schedule.js";

class LNSucessResponse<T extends LNAbstractMsgBody> {
    constructor(
        readonly status: 0,
        readonly data: T
    ) {}
}

class LNErrorResponse {
    declare readonly data: undefined;
    constructor(
        readonly status: Exclude<number, 0>,
    ) {}
}

type LNResponseData<T extends LNAbstractMsgBody = LNAbstractMsgBody> = LNSucessResponse<T> | LNErrorResponse;


export class LNActiveRequest {

    constructor(
        readonly id: Uint32,
        protected readonly result = new Deferred<LNResponseData>(),
        protected readonly timeout = new Schedule(() => {
            this.resolve(new LNErrorResponse(1));
        }, 5_000)
    ) {}

    static fromRequestMsg(msg: LNRequestMsg) {
        return new LNActiveRequest(msg.requestID);
    }

    public resolve(response: LNResponseData) {
        this.timeout.cancel();
        this.result.resolve(response);
    }

    public awaitResult() {
        return this.result.awaitResult();
    }

    public toCompactData() {
        return new LNActiveRequestCompactData(this.result, this.timeout);
    }

}

class LNActiveRequestCompactData {
    constructor(
        readonly result: Deferred<LNResponseData>,
        readonly timeout: Schedule
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

        super.set(req.id, req.toCompactData());
        return req;
    }

    // @ts-ignore
    public get(id: Uint32) {
        const data = super.get(id);
        if (!data) return;
        return new LNActiveRequest(id, data.result, data.timeout);
    }

    public has(id: Uint32) {
        return super.has(id);
    }

    public delete(id: Uint32) {
        return super.delete(id);
    }
}

