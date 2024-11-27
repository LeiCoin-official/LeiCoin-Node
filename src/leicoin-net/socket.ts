import cli from "../cli/cli.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint256 } from "low-level";
import LCrypt from "../crypto/index.js";
import { LNBroadcastMsg, LNRequestMsg, LNResponseMsg, LNStandartMsg } from "./messaging/netPackets.js";
import { LNActiveRequests } from "./requests.js";
import type { LNMsgRequestHandler, LNBroadcastingMsgHandler, LNMsgDefaultHandler } from "./messaging/abstractMsgHandler.js";
import LeiCoinNetNode from "./index.js";
import type { LNMsgID, LNAbstractMsgBody } from "./messaging/abstractMsg.js";
import { MessageRouter } from "./messaging/index.js";
import { LNController, PeerSocketController } from "./controller.js";


export class PeerSocket {
    
    readonly host: string;
    readonly port: number;
    readonly uuid = new Uint256(LCrypt.randomBytes(32));
    readonly challenge = new Uint256(LCrypt.randomBytes(32));
    public verified = false;

    constructor(
        protected readonly tcpSocket: Socket<any>,
        readonly type: "INCOMING" | "OUTGOING",
        readonly activeRequests: LNActiveRequests = new LNActiveRequests()
    ) {
        this.host = tcpSocket.remoteAddress;
        /** @todo Change this to `this.port = tcpSocket.remotePort;` when Bun has implemented scoket.remotePort */
        this.port = 0;

        tcpSocket.data = this;
    }

    static async connect(
        host: string,
        port: number
    ) {
        try {
            const socket = (await Bun.connect({
                hostname: host, port,
                socket: LNSocketHandler.Client,
            })).data;

            return socket;

        } catch (err: any) {
            cli.leicoin_net.error(`Failed to connect to ${host}:${port}. Error: ${err.name}`);
            return null;
        }
    }

    get uri() {
        return `${this.host}:${this.port}`;
    }

    async send(data: LNStandartMsg | Uint) {
        return this.tcpSocket.write(
            data instanceof LNStandartMsg
                ? data.encodeToHex().getRaw()
                : data.getRaw()
        );
    }

    /** @todo Data should be an object that */
    async request<T extends LNAbstractMsgBody>(data: LNRequestMsg<T>) {
        this.send(data.encodeToHex());

        const req = this.activeRequests.add(data);

        const response = await req.awaitResult();
        return response as T;
    }

    async receive(rawData: Uint) {
        const handler = MessageRouter.getMsgInfo(rawData.slice(0, 2) as LNMsgID)?.Handler;
        if (!handler) return;

        switch (handler.type) {

            case "DEFAULT": {
                const msg = LNStandartMsg.fromDecodedHex(rawData);
                if (!msg) return;

                (handler as LNMsgDefaultHandler).receive(msg.data, this);
                return;
            }
            case "REQUEST": {
                const msg = LNRequestMsg.fromDecodedHex(rawData);
                if (!msg) return;

                // Reserved Space for internal use
                if (msg.requestID.lte(0xff) || this.activeRequests.has(msg.requestID)) {
                    return;
                }

                const response = await (handler as LNMsgRequestHandler).receive(msg.data, this);
                if (response) {
                    this.send(new LNResponseMsg(msg.requestID, response));
                }
                return;
            }
            case "RESPONSE": {
                const msg = LNResponseMsg.fromDecodedHex(rawData);
                if (!msg) return;

                const request = this.activeRequests.get((msg as LNResponseMsg).requestID);
                if (request) {
                    request.resolve(msg.data);
                }
                return;
            }
            case "BROADCAST": {
                const msg = LNBroadcastMsg.fromDecodedHex(rawData);
                if (!msg) return;

                const cb = await (handler as LNBroadcastingMsgHandler).receive(msg.data);
                if (cb) {
                    LNController.broadcast(new LNBroadcastMsg(cb));
                }
                return;
            }
        }
    }

    async close(lastMessage?: Uint) {
        return this.tcpSocket.end(lastMessage?.getRaw());
    }
}

export namespace LNSocketHandler {
    
    abstract class BasicSocketHandler implements SocketHandler<PeerSocket> {

        readonly binaryType = "buffer";
        protected abstract readonly handlesConnections: "INCOMING" | "OUTGOING";
    
        protected static instance: BasicSocketHandler;
    
        constructor() {
            const CLS = this.constructor as typeof BasicSocketHandler;
            if (!CLS.instance) {
                CLS.instance = this;
            }
            return CLS.instance;
        }
    
        /** @todo implement timount for first message after connection open */
        async open(tcpSocket: Socket<PeerSocket>) {
            const socket = new PeerSocket(tcpSocket, this.handlesConnections);
        
            LeiCoinNetNode.connections.queue.add(socket);
            cli.leicoin_net.info(`A Connection was established with ${socket.uri}`);

            PeerSocketController.onConnectionInit(socket);
        }
    
        async close(socket: Socket<PeerSocket>) {
            LeiCoinNetNode.connections.remove(socket.data);
            cli.leicoin_net.info(`Connection to ${socket.data.uri} closed.`);
        }
        async end(socket: Socket<PeerSocket>) {
            LeiCoinNetNode.connections.remove(socket.data);
            cli.leicoin_net.info(`${socket.data.uri} has ended the connection.`);
        }
    
        async timeout(socket: Socket<PeerSocket>) {
            cli.leicoin_net.info(`Connection to ${socket.data.uri} timed out.`);
        }
    
        async error(socket: Socket<PeerSocket>, error: Error) {
            cli.leicoin_net.error(`Connection Error: ${error.stack}`);
        }
    
        async data(socket: Socket<PeerSocket>, data: Buffer) {
            socket.data.receive(new Uint(data));
        }
    
        async drain(socket: Socket<PeerSocket>) {}
    
        async handshake(socket: Socket<PeerSocket>, success: boolean, authorizationError: Error | null) {}
    }

    export type Basic = BasicSocketHandler;

    
    export const Server: BasicSocketHandler = new class LNServerSocketHandler extends BasicSocketHandler {
        protected readonly handlesConnections = "INCOMING";
    }
    
    export const Client: BasicSocketHandler = new class LNClientSocketHandler extends BasicSocketHandler {
        protected readonly handlesConnections = "OUTGOING";
    }

}

