import cli from "../cli/cli.js";
import { Pipelines } from "./pipelines/index.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, type Uint256 } from "../binary/uint.js";
import LCrypt from "../crypto/index.js";
import { type LNConnections } from "./connections.js";

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
    readonly uri: string;
    readonly id: Uint256;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
        this.uri = `${host}:${port}`;
        this.id = LCrypt.sha256(Uint.from(this.uri, "utf8"));
    }
}

export interface LNSocket extends Socket<SocketData> {
    write(data: Buffer, byteOffset?: number, byteLength?: number): number;
}

class BasicLNSocketHandler implements SocketHandler<SocketData> {
    readonly binaryType = "buffer";

    constructor(
        protected readonly connections: LNConnections
    ) {}

    async open(socket: LNSocket) {
        this.connections.add(socket);
        cli.leicoin_net.info(
            `A Connection was established with ${socket.data.uri}`
        );
    }

    async close(socket: LNSocket) {
        this.connections.remove(socket);
        cli.leicoin_net.info(`Connection to ${socket.data.uri} closed.`);
    }
    async end(socket: LNSocket) {
        this.connections.remove(socket);
        cli.leicoin_net.info(`Connection to ${socket.data.uri} ended.`);
    }

    async timeout(socket: LNSocket) {
        cli.leicoin_net.info(`Connection to ${socket.data.uri} timed out.`);
    }

    async error(socket: LNSocket, error: Error) {
        cli.leicoin_net.info(`Connection Error: ${error.stack}`);
    }
    async connectError(socket: LNSocket, error: Error) {
        cli.leicoin_net.info(
            `Connection Error: ${error.stack}`
        );
    }

    async data(socket: LNSocket, data: Buffer) {
        Pipelines.receiveData(data);
    }

    async drain(socket: LNSocket) {}

    async handshake(
        socket: LNSocket,
        success: boolean,
        authorizationError: Error | null
    ) {}
}

export { type BasicLNSocketHandler }

export class LNSocketHandler extends BasicLNSocketHandler {

    static instance: LNSocketHandler;

    static createInstance(connections: LNConnections) {
        if (!this.instance) {
            this.instance = new LNSocketHandler(connections);
        }
        return this.instance;
    }

    private constructor(connections: LNConnections) {
        super(connections);
    }

};

