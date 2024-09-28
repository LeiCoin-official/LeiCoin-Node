import cli from "../cli/cli.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint256, Uint32 } from "../binary/uint.js";
import LCrypt from "../crypto/index.js";
import { type LNConnections } from "./connections.js";
import { LNMsgType, LNRequestMsg } from "./messaging/messageTypes.js";
import { Deferred } from "../utils/deferred.js";
import { UintMap } from "../binary/map.js";
import MessageRouter from "./messaging/index.js";

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

export class LNRequest {

    readonly expectedTypes: LNMsgType[];

    constructor(
        expectedTypes: LNMsgType[] | LNMsgType,
        readonly requestID: Uint32 = new Uint32(LCrypt.randomBytes(4)),
        readonly result: Deferred<Uint> = new Deferred()
    ) {
        this.expectedTypes = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
    }

    public resolve(data: Uint) {
        /**
         * @todo Check if the data is of the expected type and more error handling
         * @todo Implement a timeout for the request
         */
        this.result.resolve(data);
    }

}

// export namespace LNRequest {
//     export enum Type {
//         INCOMING,
//         OUTGOING
//     }
// }

export class LNSocket {

    readonly meta: SocketMetadata = new SocketMetadata();

    constructor(
        protected socket: Socket<any>,
        readonly activeRequests: UintMap<LNRequest> = new UintMap()
    ) {}

    static async connect(host: string, port: number, handler: BasicLNSocketHandler) {
        try {
            await Bun.connect({
                hostname: host,
                port,
                socket: handler
            });
        } catch (err: any) {
            cli.leicoin_net.error(`Failed to connect to ${host}:${port}. Error: ${err.name}`);
            return null;
        }
    }

    async send(data: Uint | Buffer) {
        return this.socket.write(
            data instanceof Uint ? data.getRaw() : data
        );
    }
    

    /** @todo Data should be an object that */ 
    async request(data: LNRequestMsg) {
        return new Promise<Uint>((resolve) => {
            const request = new LNRequest(data.type);
            this.activeRequests.set(request.requestID, request);

            this.send(Uint.concat([
                data.type,
                request.requestID,
                data.encodeToHex()
            ]));

            const response = request.result.awaitResult();
            resolve(response);
        });
    }

    async receive(data: Uint | Buffer) {
        const type = new LNMsgType(data.subarray(0, 2));

        const channel = MessageRouter.getChannel(type);

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
                cli.leicoin_net.info(
                    `A Connection was established with ${socket.data.uri}`
                );
            }
        
            async close(socket: Socket<LNSocket>) {
                connections.remove(socket);
                cli.leicoin_net.info(`Connection to ${socket.data.uri} closed.`);
            }
            async end(socket: Socket<LNSocket>) {
                connections.remove(socket);
                cli.leicoin_net.info(`Connection to ${socket.data.uri} ended.`);
            }
        
            async timeout(socket: Socket<LNSocket>) {
                cli.leicoin_net.info(`Connection to ${socket.data.uri} timed out.`);
            }
        
            async error(socket: Socket<LNSocket>, error: Error) {
                cli.leicoin_net.error(`Connection Error: ${error.stack}`);
            }
            async connectError(socket: Socket<LNSocket>, error: Error) {
                console.log(socket)
                cli.leicoin_net.error(`Connection Error: ${error.name}`);
            }
        
            async data(socket: Socket<LNSocket>, data: Buffer) {
                socket.data.receive(data);
            }
        
            async drain(socket: Socket<LNSocket>) {}
        
            async handshake(
                socket: Socket<LNSocket>,
                success: boolean,
                authorizationError: Error | null
            ) {}
        }
    }
}


