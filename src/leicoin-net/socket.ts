import cli from "../cli/cli.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint256 } from "low-level";
import LCrypt from "../crypto/index.js";
import { type LNConnections } from "./connections.js";
import { LNBroadcastMsg, LNRequestMsg, LNStandartMsg } from "./messaging/netPackets.js";
import { LNActiveRequests } from "./requests.js";
import { type LNBroadcastingMsgHandler } from "./messaging/abstractChannel.js";

export class SocketMetadata {
    constructor(
        public verified = false,
        public host = "",
        public port = 0,
        public id = Uint256.empty(),
        public challenge = new Uint256(LCrypt.randomBytes(32))
    ) {}

    get uri() {
        return `${this.host}:${this.port}`;
    }
}

export class LNSocket {
    readonly meta: SocketMetadata = new SocketMetadata();

    constructor(
        protected socket: Socket<any>,
        readonly activeRequests: LNActiveRequests = new LNActiveRequests()
    ) {}

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
            cli.leicoin_net.error(
                `Failed to connect to ${host}:${port}. Error: ${err.name}`
            );
            return null;
        }
    }

    async send(data: LNStandartMsg | Uint) {
        return this.socket.write(
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
        return this.socket.end(lastMessage?.getRaw());
    }
}


export abstract class BasicLNSocketHandler implements SocketHandler<LNSocket> {
    readonly binaryType = "buffer";
}

export class LNSocketHandlerFactory {
    static create(connections: LNConnections) {
        return new class LNSocketHandler extends BasicLNSocketHandler implements SocketHandler<LNSocket> {
            async open(socket: Socket<LNSocket>) {
                socket.data = new LNSocket(socket);

                connections.add(socket.data);
                cli.leicoin_net.info(`A Connection was established with ${socket.data.meta.uri}`);
            }

            async close(socket: Socket<LNSocket>) {
                connections.remove(socket.data);
                cli.leicoin_net.info(
                    `Connection to ${socket.data.meta.uri} closed.`
                );
            }
            async end(socket: Socket<LNSocket>) {
                connections.remove(socket.data);
                cli.leicoin_net.info(`Connection to ${socket.data.meta.uri} ended.`);
            }

            async timeout(socket: Socket<LNSocket>) {
                cli.leicoin_net.info(`Connection to ${socket.data.meta.uri} timed out.`);
            }

            async error(socket: Socket<LNSocket>, error: Error) {
                cli.leicoin_net.error(`Connection Error: ${error.stack}`);
            }

            async data(socket: Socket<LNSocket>, data: Buffer) {
                socket.data.receive(new Uint(data));
            }

            async drain(socket: Socket<LNSocket>) {}

            async handshake(
                socket: Socket<LNSocket>,
                success: boolean,
                authorizationError: Error | null
            ) {}
        }();
    }
}
