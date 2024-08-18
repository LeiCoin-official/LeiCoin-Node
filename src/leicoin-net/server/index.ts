import cli from "../../cli/cli.js";
import WebSocket, { WebSocketServer } from "ws";
import pipelines from "../pipelines/index.js";
import { TCPSocketListener, TCPSocketListenOptions, Socket, SocketHandler, BinaryTypeList } from "bun";
import config from "../../config/index.js";
import { AddressHex } from "../../objects/address.js";
import { Uint256 } from "../../utils/binary.js";
import LCrypt from "../../crypto/index.js";
import Schedule from "../../utils/schedule.js";
import { LeiCoinNetDataPackage, NPPX } from "../../objects/leicoinnet.js";

class UnverifiedSocket {
    readonly verified: boolean;
    readonly challenge: Uint256;
    readonly address: AddressHex | null;

    constructor(
        verified = false,
        challenge = new Uint256(LCrypt.randomBytes(32)),
        address: AddressHex | null = null
    ) {
        this.verified = verified;
        this.challenge = challenge;
        this.address = address;
    }
}

class VerifiedSocket extends UnverifiedSocket {
    readonly verified: true;
    readonly address: AddressHex;

    constructor(verified: true, challenge: Uint256, address: AddressHex) {
        super(verified, challenge, address);
        this.verified = verified;
        this.address = address;
    }

}

type SocketData = UnverifiedSocket | VerifiedSocket;

interface LSocket extends Socket<SocketData> {
    write(
        data: Buffer,
        byteOffset?: number,
        byteLength?: number
    ): number;
}


class LeiCoinNetSocketHandler implements SocketHandler<SocketData> {

    private static instance: LeiCoinNetSocketHandler;
    constructor() {
        if (!LeiCoinNetSocketHandler.instance) {
            LeiCoinNetSocketHandler.instance = this;
        }
        return LeiCoinNetSocketHandler.instance;
    }

    readonly binaryType = "buffer";

    async open(socket: LSocket) {
        socket.data = new UnverifiedSocket();
        leicoinNetServer.connections.push(socket);
        cli.leicoin_net.server.info(`${socket.remoteAddress}:${socket.localPort} established as connection to this Server.`);
    }

    async close(socket: LSocket) {
        const index = leicoinNetServer.connections.indexOf(socket);
        if (index !== -1) {
            leicoinNetServer.connections.splice(index, 1);
        }
        cli.leicoin_net.server.info(`WebSocket connection to ${socket.remoteAddress}:${socket.localPort} closed.`);
    }

	async error(socket: LSocket, error: Error) {
        cli.leicoin_net.server.info(`Error: ${error.stack}`);
    }

    async data(socket: LSocket, data: Buffer) {
        pipelines.receiveData(data);
    }
	
    async drain(socket: LSocket) {

    }

	async handshake(socket: LSocket, success: boolean, authorizationError: Error | null) {

    }

	async end(socket: LSocket) {

    }

	async connectError(socket: LSocket, error: Error) {

    }

	async timeout(socket: LSocket) {

    }

    async challenge(socket: LSocket) {
        
        socket.write(LeiCoinNetDataPackage.create(
            NPPX.CHALLENGE,
            socket.data.challenge
        ));


        new Schedule(() => {

            

        }, 5000);

    }

}

class LeiCoinNetServer {

    private tcpServer: TCPSocketListener | null = null;

    public readonly connections: LSocket[] = [];

    private static instance: LeiCoinNetServer;
    constructor() {
        if (!LeiCoinNetServer.instance) {
            LeiCoinNetServer.instance = this;
        }
        return LeiCoinNetServer.instance;
    }

    public start() {

        this.tcpServer = Bun.listen<SocketData>({
            hostname: config.leicoin_net.host,
            port: config.leicoin_net.port,
            socket: new LeiCoinNetSocketHandler()
        });

    }

}

const leicoinNetServer = new LeiCoinNetServer();
export default leicoinNetServer;


export function initLeiCoinNetServer(options: WebSocket.ServerOptions) {

    websocket_server.on('connection', (ws, req) => {

        nodeConnections.push(ws);

        cli.leicoin_net.server.info(`${req.socket.remoteAddress}:${req.socket.remotePort} established as connection to this Server.`);

        ws.on('error', (error) => {
            cli.leicoin_net.server.info(`Websocket Server Error: ${error.stack}`);
            //utils.events.emit("ws_reconnect");
        });

        // Handle WebSocket disconnections for nodes
        ws.on('close', () => {
            // Remove the WebSocket connection from the nodeConnections array
            const index = nodeConnections.indexOf(ws);
            if (index !== -1) {
                nodeConnections.splice(index, 1);
            }
            cli.leicoin_net.server.info(`WebSocket connection to ${req.socket.remoteAddress}:${req.socket.remotePort} closed.`);
        });
        
    });

    return websocket_server;

}

