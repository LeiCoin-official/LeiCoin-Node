import cli from "../cli/cli.js";
import { MessageRouter } from "./messaging/index.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint32, type Uint256 } from "../binary/uint.js";
import LCrypt from "../crypto/index.js";
import { type LNConnections } from "./connections.js";
import { LNMsgType } from "./messaging/messageTypes.js";
import { UintMap } from "../binary/map.js";

// class UnverifiedSocket {
//     readonly verified: boolean;
//     readonly challenge: Uint256;
//     readonly address: AddressHex | null;

//     constructor(
//         verified = false,
//         challenge = new Uint256(LCrypt.randomBytes(32)),
//         address: AddressHex | null = null
//     ) {
//         this.verified = verified;
//         this.challenge = challenge;
//         this.address = address;
//     }
// }

// class VerifiedSocket extends UnverifiedSocket {
//     readonly verified: true;
//     readonly address: AddressHex;

//     constructor(verified: true, challenge: Uint256, address: AddressHex) {
//         super(verified, challenge, address);
//         this.verified = verified;
//         this.address = address;
//     }

// }

// async challenge(socket: LSocket) {

//     socket.write(LeiCoinNetDataPackage.create(
//         NPPX.CHALLENGE,
//         socket.data.challenge
//     ));

//     new Schedule(() => {

//     }, 5000);

// }

// type SocketData = UnverifiedSocket | VerifiedSocket;

export class SocketData {
    //readonly address: AddressHex;
    readonly host: string;
    readonly port: number;
    readonly id: Uint256;

    constructor(
        readonly host: string
        readonly port: number
    ) {
        this.host = host;
        this.port = port;
        this.id = LCrypt.sha256(Uint.from(`${host}:${port}`, "utf8"));
    }
}

// export interface LNSocket extends Socket<SocketData> {
//     write(data: Buffer, byteOffset?: number, byteLength?: number): number;
// }

export class Request {

    constructor(
        readonly type: LNMsgType,
        readonly requestID: Uint32
    ) {}

}

export class LNSocket {

    readonly activeRequests: UintMap<Request> = new UintMap();

    constructor(protected socket: Socket) {}

    static async connect(host: string, port: number, handler: BasicLNSocketHandler) {
        try {
            return new LNSocket(await Bun.connect({
                hostname: host,
                port,
                socket: handler
            }));
        } catch (err: any) {
            cli.leicoin_net.error(`Failed to connect to ${host}:${port}. Error: ${err.name}`);
            return null;
        }
    }

    async send(data: Uint) {
        return this.socket.write(data.getRaw());
    }
    
    async receive() {
        
    }

    async close(lastMessage?: Uint) {
        return this.socket.end(lastMessage?.getRaw());
    }

}

export abstract class BasicLNSocketHandler implements SocketHandler<SocketData> {
    readonly binaryType = "buffer";
}

export class LNSocketHandlerFactory {
    static create(connections: LNConnections) {

        return new class LNSocketHandler extends BasicLNSocketHandler implements SocketHandler<SocketData> {
        
            async open(socket: Socket<SocketData>) {
                connections.add(socket);
                cli.leicoin_net.info(
                    `A Connection was established with ${socket.data.uri}`
                );
            }
        
            async close(socket: Socket<SocketData>) {
                connections.remove(socket);
                cli.leicoin_net.info(`Connection to ${socket.data.uri} closed.`);
            }
            async end(socket: Socket<SocketData>) {
                connections.remove(socket);
                cli.leicoin_net.info(`Connection to ${socket.data.uri} ended.`);
            }
        
            async timeout(socket: Socket<SocketData>) {
                cli.leicoin_net.info(`Connection to ${socket.data.uri} timed out.`);
            }
        
            async error(socket: Socket<SocketData>, error: Error) {
                cli.leicoin_net.error(`Connection Error: ${error.stack}`);
            }
            async connectError(socket: Socket<SocketData>, error: Error) {
                console.log(socket)
                cli.leicoin_net.error(`Connection Error: ${error.name}`);
            }
        
            async data(socket: Socket<SocketData>, data: Buffer) {
                MessageRouter.receiveData(data, socket.data.id);
            }
        
            async drain(socket: Socket<SocketData>) {}
        
            async handshake(
                socket: Socket<SocketData>,
                success: boolean,
                authorizationError: Error | null
            ) {}
        }
    }
}


