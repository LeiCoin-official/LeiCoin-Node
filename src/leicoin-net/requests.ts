import { AbstractBinaryMap, Uint32 } from "low-level";
import { Deferred } from "../utils/deferred.js";
import { LNAbstractMsgBody } from "./messaging/abstractMsg.js";
import { LNRequestMsg } from "./messaging/netPackets.js";
import Schedule from "../utils/schedule.js";
import { ErrorResponseMsg } from "./messaging/messages/error.js";

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

export type LNResponseData<T extends LNAbstractMsgBody = LNAbstractMsgBody> = LNSucessResponse<T> | LNErrorResponse;


export class LNActiveRequest<T extends LNAbstractMsgBody = LNAbstractMsgBody> {

    constructor(
        readonly id: Uint32,
        protected readonly result = new Deferred<LNResponseData<T>>(),
        protected readonly timeout = new Schedule(() => {
            this.resolve(new LNErrorResponse(1));
        }, 5_000)
    ) {}

    static fromRequestMsg<T extends LNAbstractMsgBody>(msg: LNRequestMsg<T>) {
        return new LNActiveRequest<T>(msg.requestID);
    }

    public resolve(response: LNResponseData | LNAbstractMsgBody) {
        this.timeout.cancel();

        if (response instanceof LNAbstractMsgBody) {
            if (response instanceof ErrorResponseMsg) {
                response = new LNErrorResponse(response.id.toInt());
            } else {
                response = new LNSucessResponse(0, response);
            }
        }

        this.result.resolve(response as LNResponseData<T>);
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

    public add<T extends LNAbstractMsgBody>(req: LNRequestMsg<T> | LNActiveRequest<T>): LNActiveRequest<T> {
        if (req instanceof LNRequestMsg) {
            return this.add(LNActiveRequest.fromRequestMsg<T>(req));
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

