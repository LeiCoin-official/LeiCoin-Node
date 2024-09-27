import cli from "../cli/cli.js";
import { MessageRouter } from "./messaging/index.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint256, Uint32 } from "../binary/uint.js";
import LCrypt from "../crypto/index.js";
import { type LNConnections } from "./connections.js";
import { LNMsgType } from "./messaging/messageTypes.js";
import { UintMap } from "../binary/map.js";
import Schedule from "../utils/schedule.js";


// type SocketData = UnverifiedSocket | VerifiedSocket;

// export interface LNSocket extends Socket<SocketData> {
//     write(data: Buffer, byteOffset?: number, byteLength?: number): number;
// }


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

    readonly expectedTypes: LNMsgType | LNMsgType[];

    constructor(requestID: Uint32, type: LNRequest.Type, expectedTypes: LNMsgType[]);
    constructor(requestID: Uint32, type: LNRequest.Type, expectedType: LNMsgType);
    constructor(
        readonly requestID: Uint32,
        readonly type: LNRequest.Type,
        arg2: LNMsgType | LNMsgType[]
    ) {
        this.expectedTypes = Array.isArray(arg2) ? arg2 : [arg2];
    }

    public resolve(data: Uint) {
        
    }

}

export namespace LNRequest {
    export enum Type {
        INCOMING,
        OUTGOING
    }
}

export class LNSocket {

    readonly meta: SocketMetadata = new SocketMetadata();

    constructor(
        protected socket: Socket<any>,
        readonly activeRequests: Uint32[]
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
    async request(data: any) {
        return new Promise<Uint>((resolve) => {
            const requestID = new Uint32(LCrypt.randomBytes(4))
            this.activeRequests.push(requestID);



        });
    }

    async receive(data: Uint | Buffer) {
        
        // MessageRouter.receiveData(data, this);

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


