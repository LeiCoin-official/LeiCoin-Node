import { TCPSocketListener } from "bun";
import config from "../config/index.js";
import { lnSocketHandler, LNSocket, SocketData } from "./socket.js";
import utils from "../utils/index.js";
import cli from "../cli/cli.js";

export class LeiCoinNetNode {

    private static server: TCPSocketListener<SocketData>;

    private static readonly connections: LNSocket[] = [];

    static async init(): Promise<void> {
        Promise.all([
            this.startSerevr(),
            this.initConnections()
            this.setupEvents(),
        ]);
    }

    private static async startSerevr() {
        this.server = Bun.listen<SocketData>({
            hostname: config.leicoin_net.host,
            port: config.leicoin_net.port,
            socket: lnSocketHandler
        });
    }

    private static async initConnections() {
        const promises: Promise<void>[] = [];

        // Connect to other peer nodes and create peer-to-peer connections
        for (const targetData of config.peers) {
            const dataArray = targetData.split(":");
            const host = dataArray[0];
            const port = dataArray[1] ? parseInt(dataArray[1]) : 12200;

            if (!host) {
                cli.leicoin_net.error(`Invalid Connection Data: ${targetData}`);
                continue;
            }
            if (!port) {
                cli.leicoin_net.error(`Invalid Connection Data: ${targetData}`);
                continue;
            }

            promises.push(this.connectToNode(host, port));
        }
            
        await Promise.all(promises);
    }

    private static async connectToNode(host: string, port: number) {
        const connection = await Bun.connect<SocketData>({
            hostname: host,
            port: port,
            socket: lnSocketHandler
        })
        this.connections.push(connection);
    }

    private static async stop() {
        this.server.stop();

        for (const connection of this.connections) {
            connection.end();
        }

        cli.leicoin_net.info(`LeiCoinNet-Node stopped`);
    }

    static async broadcast(data: Buffer) {



    }

    private static setupEvents() {
        utils.events.once("stop_server", async() => await this.stop());
    }

    //#region Connectiosn Management

    static addConnection(socket: LNSocket, genData = true) {
        if (genData) {
            socket.data = new SocketData(socket.remoteAddress, socket.localPort);
        }
        this.connections.push(socket);
    }

    static getConnection(): readonly LNSocket[] {
        return this.connections;
    }

    static removeConnection(socket: LNSocket) {
        const index = this.connections.indexOf(socket);
        if (index !== -1) {
            this.connections.splice(index, 1);
        }
    }

    static getAllConnections(): readonly LNSocket[] {
        return this.connections;
    }

    //#endregion

}

