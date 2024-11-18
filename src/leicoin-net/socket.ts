import cli from "../cli/cli.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint16, Uint256 } from "low-level";
import LCrypt from "../crypto/index.js";
import { LNBroadcastMsg, LNRequestMsg, LNStandartMsg } from "./messaging/netPackets.js";
import { LNActiveRequests } from "./requests.js";
import { type LNBroadcastingMsgHandler } from "./messaging/abstractMsgHandler.js";
import LeiCoinNetNode from "./index.js";
import { StatusMsg } from "./messaging/messages/status.js";
import { Port } from "../objects/netinfo.js";
import type { LNMsgType, LNAbstractMsgBody } from "./messaging/abstractMsg.js";
import { MessageRouter } from "./messaging/index.js";


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

            /** @todo Implment Protocol Versioning Later which will replace Uint16.from(0) */
            socket.send(new LNStandartMsg(
                new StatusMsg(
                    Uint16.from(0),
                    Port.from(LeiCoinNetNode.getServerInfo().port)
                )
            ));

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
        const handler = MessageRouter.getMsgInfo(rawData.slice(0, 2) as LNMsgType)?.Handler;
        if (!handler) return;

        switch (handler.acceptedMgs) {

            case "DEFAULT": {
                const msg = LNStandartMsg.fromDecodedHex(rawData);
                if (!msg) return;

                handler.receive(msg.data, this);
                return;
            }
            case "REQUEST": {
                const msg = LNRequestMsg.fromDecodedHex(rawData);
                if (!msg) return;

                const request = this.activeRequests.get((msg as LNRequestMsg).requestID);
                if (request) {
                    // Is Request Response
                    request.resolve(msg.data);
                    return;
                }
    
                // Is Incoming Request
                const response = await handler.receive(msg.data, this);
                if (response) {
                    this.send(new LNRequestMsg(msg.requestID, response));
                }
                return;
            }
            case "BROADCAST": {
                const msg = LNBroadcastMsg.fromDecodedHex(rawData);
                if (!msg) return;

                const cb = await (handler as LNBroadcastingMsgHandler).receive(msg.data);
                if (cb) {
                    this.send(new LNBroadcastMsg(cb));
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
        async open(socket: Socket<PeerSocket>) {
            socket.data = new PeerSocket(socket, this.handlesConnections);
        
            LeiCoinNetNode.connections.queue.add(socket.data);
            cli.leicoin_net.info(`A Connection was established with ${socket.data.uri}`);
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

