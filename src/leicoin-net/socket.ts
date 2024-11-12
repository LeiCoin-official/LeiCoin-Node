import cli from "../cli/cli.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint256 } from "low-level";
import LCrypt from "../crypto/index.js";
import { type PeerConnections } from "./connections.js";
import { LNBroadcastMsg, LNRequestMsg, LNStandartMsg } from "./messaging/netPackets.js";
import { LNActiveRequests } from "./requests.js";
import { type LNBroadcastingMsgHandler } from "./messaging/abstractChannel.js";


export class PeerSocket {
    readonly host: string;
    public port = 0;
    readonly uuid = new Uint256(LCrypt.randomBytes(32));
    readonly challenge = new Uint256(LCrypt.randomBytes(32));
    public verified = false;

    constructor(
        protected readonly tcpSocket: Socket<any>,
        readonly activeRequests: LNActiveRequests = new LNActiveRequests()
    ) {
        this.host = tcpSocket.remoteAddress;
    }

    static async connect(
        host: string,
        port: number,
        handler: BasicLNSocketHandler
    ) {
        try {
            await Bun.connect({
                hostname: host,
                port,
                socket: handler,
            });
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
    async request(data: LNRequestMsg) {
        return new Promise<Uint>((resolve) => {
            const req = this.activeRequests.add(data);

            this.send(data.encodeToHex());

            const response = req.result.awaitResult();
            resolve(response);
        });
    }

    async receive(rawData: Uint) {
        const msg = LNStandartMsg.fromDecodedHex(rawData);
        if (!msg) return;

        if (msg instanceof LNRequestMsg) {
            const request = this.activeRequests.get((msg as LNRequestMsg).requestID);
            if (request) {
                // Is Request Response
                request.resolve(msg.data);
                return;
            }

            // Is Incoming Request
            const handler = (msg as LNRequestMsg).data.getHandler();
            if (handler.acceptedMgs === "REQUEST") {
                const response = await handler.receive(msg.data, this);
                if (response) {
                    this.send(new LNRequestMsg(msg.requestID, response));
                }
            }
            return;
        }

        if (msg instanceof LNBroadcastMsg) {
            const handler = (msg as LNBroadcastMsg).data.getHandler();
            if (handler.acceptedMgs === "BROADCAST") {
                const cb = await (handler as LNBroadcastingMsgHandler).receive(msg.data);
                if (cb) {
                    this.send(new LNBroadcastMsg(cb));
                }
            }
            return;
        }
    }

    async close(lastMessage?: Uint) {
        return this.tcpSocket.end(lastMessage?.getRaw());
    }
}


export abstract class BasicLNSocketHandler implements SocketHandler<PeerSocket> {
    readonly binaryType = "buffer";
}

export class LNSocketHandlerFactory {
    static create(connections: PeerConnections) {
        return new class LNSocketHandler extends BasicLNSocketHandler implements SocketHandler<PeerSocket> {
            async open(socket: Socket<PeerSocket>) {
                socket.data = new PeerSocket(socket);

                connections.add(socket.data);
                cli.leicoin_net.info(`A Connection was established with ${socket.data.uri}`);
            }

            async close(socket: Socket<PeerSocket>) {
                connections.remove(socket.data);
                cli.leicoin_net.info(`Connection to ${socket.data.uri} closed.`);
            }
            async end(socket: Socket<PeerSocket>) {
                connections.remove(socket.data);
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
        }();
    }
}
