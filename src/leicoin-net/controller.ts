import { type Uint, Uint16, Uint32 } from "low-level";
import LeiCoinNetNode from "./index.js";
import { type LNBroadcastMsg, LNRequestMsg, LNStandartMsg } from "./messaging/netPackets";
import { PeerSocket } from "./socket.js";
import { Port } from "../objects/netinfo.js";
import { StatusMsg } from "./messaging/messages/status.js";
import { LNActiveRequest } from "./requests.js";
import { ChallengeMsg, ChallengeREQMsg } from "./messaging/messages/challenge.js";


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

    private static verifyRemoteStatus(remoteStatus: StatusMsg) {
        if (
            /** @todo Implment Protocol Versioning Later which will replace remoteStatus.version.eq(0) */
            remoteStatus.version.eq(0)
        ) {
            return true;
        }
        return false;
    }

    static async onConnectionInit(socket: PeerSocket) {
        await this.accomplishHandshake(socket);
        if (socket.type === "INCOMING") {
            
        }
    }

    private static async accomplishHandshake(socket: PeerSocket) {

        if (socket.type === "OUTGOING") {
            await this.sendStatusMsg(socket);
        }

        const request = socket.activeRequests.add(new LNActiveRequest<StatusMsg>(Uint32.from(0)));

        socket.state = "READY";

        const remoteStatus = (await request.awaitResult()).data;
        socket.activeRequests.delete(request.id);

        if (!remoteStatus || !this.verifyRemoteStatus(remoteStatus)) {
            socket.close();
            return;
        }

        if (socket.type === "OUTGOING") {
            socket.state = "VERIFIED";
        }

        if (socket.type === "INCOMING") {
            socket.port = remoteStatus.port.toInt();
            await this.sendStatusMsg(socket);
            await this.challengeClient(socket, remoteStatus.port.toInt());
        }

    }

    private static async challengeClient(socket: PeerSocket, remotePort: number) {
        const request_msg = LNRequestMsg.create(new ChallengeREQMsg());
        const request = socket.request<ChallengeMsg>(request_msg);

        let client: PeerSocket;
        try {
            client = await PeerSocket.connect(socket.host, remotePort, true);
        } catch (e) {
            socket.close();
            return;
        }

        const challenge_msg = ChallengeMsg.create(request_msg.requestID);
        await client.send(challenge_msg);
        client.close();

        const response = await request;

        if (response.status === 0 && response.data?.challenge.eq(challenge_msg.challenge)) {
            socket.state = "VERIFIED";
        } else {
            socket.close();
        }
    }

}

