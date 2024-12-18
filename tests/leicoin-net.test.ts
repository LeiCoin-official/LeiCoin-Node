import { describe, test, expect } from "bun:test";
import { LNMsgRegistry } from "../src/leicoin-net/messaging/index.js";
import { GetBlocksMsg } from "../src/leicoin-net/messaging/messages/block.js";
import { Uint32, Uint64 } from "low-level";
import { LNResponseMsg } from "../src/leicoin-net/messaging/netPackets.js";
import { NetworkSyncManager } from "../src/leicoin-net/chain-sync.js";

describe("leicoin-net", () => {
    test("unique_message_ids", async () => {
        const ids: string[] = [];
        for (const value of Object.values(LNMsgRegistry)) {
            expect(ids).not.toContain(value.ID.toHex());
            ids.push(value.ID.toHex());
        }
    });
    test("send_large_get_blocks_msg_response", async () => {
        // NetworkSyncManager.state = "synchronized";
        // const decoded_response = new LNResponseMsg(Uint32.from(0x1234), await GetBlocksMsg.Handler.receive(new GetBlocksMsg(Uint64.from(0), Uint64.from(512)))).encodeToHex();
        // const response = LNResponseMsg.fromDecodedHex(decoded_response);

        // expect(response).not.toBeNull();
    });
});
