import { describe, test, expect } from "bun:test";
import { LNMsgRegistry } from "../src/leicoin-net/messaging/index.js";

describe("leicoin_net_testing", () => {
    test("unique_message_ids", () => {
        const ids: string[] = [];
        for (const value of Object.values(LNMsgRegistry)) {
            expect(ids).not.toContain(value.TYPE.toHex());
            ids.push(value.TYPE.toHex());
        }
    });
});
