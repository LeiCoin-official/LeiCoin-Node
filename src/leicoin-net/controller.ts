import { type Uint, Uint16, Uint32 } from "low-level";
import LeiCoinNetNode from "./index.js";
import { type LNBroadcastMsg, LNStandartMsg } from "./messaging/netPackets";
import { type PeerSocket } from "./socket.js";
import { Port } from "../objects/netinfo.js";
import { StatusMsg } from "./messaging/messages/status.js";
import { LNActiveRequest } from "./requests.js";


export class LNController {

    static async broadcast(data: LNBroadcastMsg | Uint) {
        for (const connection of LeiCoinNetNode.connections.values()) {
            connection.send(data);
        }
    }

}

export class PeerSocketController {

    private static async sendStatusMsg(socket: PeerSocket) {
        /** @todo Implment Protocol Versioning Later which will replace Uint16.from(0) */
        return socket.send(new LNStandartMsg(
            new StatusMsg(
                Uint16.from(0),
                Port.from(LeiCoinNetNode.getServerInfo().port)
            )
        ));
    }

    private static checkRemoteStatus(remoteStatus: StatusMsg) {
        if (
            /** @todo Implment Protocol Versioning Later which will replace remoteStatus.version.eq(0) */
            remoteStatus.version.eq(0)
        ) {
            return true;
        }
        return false;
    }

    static async onConnectionInit(socket: PeerSocket) {
        switch (socket.type) {
            case "INCOMING":
                return this.onIncomingConnectionInit(socket);
            case "OUTGOING":
                return this.onOutgoingConnectionInit(socket);
        }
    }

    private static async onIncomingConnectionInit(socket: PeerSocket) {

        const request = new LNActiveRequest(Uint32.from(0));
        socket.activeRequests.add(request);
        const remoteStatus = await request.awaitResult() as StatusMsg;

        if (!this.checkRemoteStatus(remoteStatus)) {
            socket.close();
            return;
        }

        await this.sendStatusMsg(socket);

    }

    private static async onOutgoingConnectionInit(socket: PeerSocket) {

        await this.sendStatusMsg(socket);

        const request = new LNActiveRequest(Uint32.from(0));
        socket.activeRequests.add(request);
        const remoteStatus = await request.awaitResult() as StatusMsg;

        if (!this.checkRemoteStatus(remoteStatus)) {
            socket.close();
            return;
        }        

    }

}

