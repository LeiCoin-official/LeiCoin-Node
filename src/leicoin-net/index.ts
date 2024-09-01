import { type TCPSocketListener } from "bun";
import { LNSocketHandlerFactory, type BasicLNSocketHandler, type SocketData } from "./socket.js";
import cli from "../cli/cli.js";
import { LNConnections } from "./connections.js";
import { type EventEmitter } from "events";
import { Pipelines } from "./pipelines/index.js";
import { ModuleLike } from "../utils/dataUtils.js";

export class LeiCoinNetNode implements ModuleLike<typeof LeiCoinNetNode> {
    public static initialized = false;
    public static started = false;

    private static server: TCPSocketListener<SocketData>;

    private static connections: LNConnections;
    private static socketHandler: BasicLNSocketHandler;

    static async init() {
        if (this.initialized) return;
        this.initialized = true;

        this.connections = LNConnections.createInstance();
        Pipelines.registerPipelines();
        this.socketHandler = LNSocketHandlerFactory.create(this.connections);
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
            this.server = Bun.listen<SocketData>({
                hostname: host,
                port: port,
                socket: this.socketHandler
            });
        } catch (error: any) {
            cli.leicoin_net.error(`Failed to start server on ${host}:${port}, Error: ${error.stack}`);
        }
    }

    /** @param peers Array of strings in the format "host:port" if no port is provided, the default port is 12200 */
    private static async initPeers(peers: readonly string[]) {
        const promises: Promise<void>[] = [];

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

            promises.push(this.connectToNode(host, port));
        }

        await Promise.all(promises);
    }

    private static async connectToNode(host: string, port: number) {
        try {
            const connection = await Bun.connect<SocketData>({
                hostname: host,
                port: port,
                socket: this.socketHandler
            })
            this.connections.add(connection);
        } catch (error: any) {
            cli.leicoin_net.error(`Failed to connect to ${host}:${port}, Error: ${error.stack}`);
        }
    }

    static async stop() {
        
        for (const connection of this.connections.values()) {
            connection.end();
        }
        cli.leicoin_net.info(`Closed ${this.connections.size} connections`);

        if (this.server) {
            this.server.stop();
        } else {
            cli.leicoin_net.error(`LeiCoinNet-Node connot be stopped, because it is not running`);
        }

        cli.leicoin_net.info(`LeiCoinNet-Node stopped`);
    }

    static async broadcast(data: Buffer) {
        for (const connection of this.connections.values()) {
            connection.write(data);
        }
    }

    private static async setupEvents(eventHandler: EventEmitter) {
        eventHandler.once("stop_server", async() => await this.stop());
    }

}

export default LeiCoinNetNode;