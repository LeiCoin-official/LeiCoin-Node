import cli from "../cli/cli.js";
import pipelines from "./pipelines/index.js";
import { Socket, SocketHandler } from "bun";
import { LeiCoinNetNode } from "./index.js";
import { Uint, Uint256 } from "../binary/uint.js";
import LCrypt from "../crypto/index.js";

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
        connections

    ) {

    }

    async open(socket: LNSocket) {
        LeiCoinNetNode.addConnection(socket);
        cli.leicoin_net.info(
            `A Connection was established with ${socket.data.uri}`
        );
    }

    async close(socket: LNSocket) {
        LeiCoinNetNode.removeConnection(socket);
        cli.leicoin_net.info(`Connection to ${socket.data.uri} closed.`);
    }
    async end(socket: LNSocket) {
        LeiCoinNetNode.removeConnection(socket);
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
            `Connection Error: ${error.stack} on ${socket.data.uri}`
        );
    }

    async data(socket: LNSocket, data: Buffer) {
        pipelines.receiveData(data);
    }

    async drain(socket: LNSocket) {}

    async handshake(
        socket: LNSocket,
        success: boolean,
        authorizationError: Error | null
    ) {}
}

export { type BasicLNSocketHandler }

export class LNSocketHandler extends BasicLNSocketHandler {};

