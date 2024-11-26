import { Uint16, type Uint } from "low-level";
import LeiCoinNetNode from "./index.js";
import { LNStandartMsg } from "./messaging/netPackets";
import { type PeerSocket } from "./socket.js";
import { Port } from "../objects/netinfo.js";
import { StatusMsg } from "./messaging/messages/status.js";


export class LNController {

    static async broadcast(data: LNStandartMsg | Uint) {
        for (const connection of LeiCoinNetNode.connections.values()) {
            connection.send(data);
        }
    }

}

export class PeerSocketController {

    static async sendStatusMsg(socket: PeerSocket) {
        /** @todo Implment Protocol Versioning Later which will replace Uint16.from(0) */
        return socket.send(new LNStandartMsg(
            new StatusMsg(
                Uint16.from(0),
                Port.from(LeiCoinNetNode.getServerInfo().port)
            )
        ));
    }

    static async onConnectionInitailization(socket: PeerSocket) {

        if (socket.type === "OUTGOING") {
            await this.sendStatusMsg(socket);
        }

        


        if (socket.type === "INCOMING") {
            await this.sendStatusMsg(socket);
        }

    }

    // static async 

}

