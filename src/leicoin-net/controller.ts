import { Uint } from "low-level";
import LeiCoinNetNode from "./index.js";
import { type LNStandartMsg } from "./messaging/netPackets";


export class LNController {

    static async broadcast(data: LNStandartMsg | Uint) {
        for (const connection of LeiCoinNetNode.connections.values()) {
            connection.send(data);
        }
    }

}

