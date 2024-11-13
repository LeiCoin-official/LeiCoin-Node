import { type TCPSocketListener } from "bun";
import { LNServerSocketHandler, PeerSocket } from "./socket.js";
import cli from "../cli/cli.js";
import { PeerConnections } from "./connections.js";
import { type EventEmitter } from "events";
import { type ModuleLike } from "../utils/dataUtils.js";
import { type LNStandartMsg } from "./messaging/netPackets.js";
import { type Uint } from "low-level";
import Utils from "../utils/index.js";

export class LeiCoinNetNode implements ModuleLike<typeof LeiCoinNetNode> {
    public static initialized = false;
    public static started = false;

    private static server: TCPSocketListener<PeerSocket>;

    static connections: PeerConnections;

    static async init() {
        if (this.initialized) return;
        this.initialized = true;

        this.connections = new PeerConnections();
    }

    static async start(config: {
        host: string,
        port: number,
        peers: readonly string[]
        eventHandler?: EventEmitter
    }) {
        if (this.started) return;
        this.started = true;

        const tasks: Promise<void>[] = [];

        tasks.push(
            this.startServer(config.host, config.port),
            this.initPeers(config.peers)
        );

        if (config.eventHandler) {
            tasks.push(this.setupEvents(config.eventHandler));
        }

        await Promise.all(tasks);

        cli.leicoin_net.info(`LeiCoinNet-Node started on ${config.host}:${config.port}`);
    }

    private static async startServer(host: string, port: number) {
        try {
            this.server = Bun.listen({
                hostname: host,
                port: port,
                socket: new LNServerSocketHandler()
            });
        } catch (error: any) {
            cli.leicoin_net.error(`Failed to start server on ${host}:${port}, Error: ${error.stack}`);
            Utils.gracefulShutdown(1);
        }
    }

    /** @param peers Array of strings in the format "host:port" if no port is provided, the default port is 12200 */
    private static async initPeers(peers: readonly string[]) {
        const promises: Promise<any>[] = [];

        // Connect to other peer nodes and create peer-to-peer connections
        for (const targetData of peers) {
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

            promises.push(PeerSocket.connect(host, port));
        }

        await Promise.all(promises);
    }

    static getServerInfo() {
        return {
            host: this.server.hostname,
            port: this.server.port
        }
    }

    static async stop() {

        for (const connection of this.connections.values()) {
            connection.close();
        }

        if (this.server) {
            this.server.stop();
        } else {
            cli.leicoin_net.error(`LeiCoinNet-Node connot be stopped, because it is not running`);
        }

        cli.leicoin_net.info(`LeiCoinNet-Node stopped`);
    }

    static async broadcast(data: LNStandartMsg | Uint) {
        for (const connection of this.connections.values()) {
            connection.send(data);
        }
    }

    private static async setupEvents(eventHandler: EventEmitter) { }

}

export default LeiCoinNetNode;