import WebSocket from "ws";
import utils from "../../utils/utils.js";
import config from "../../handlers/configHandler.js";
import cli from "../../utils/cli.js";
import LeiCoinNetClient from "./client.js";

export class LeiCoinNetClientsHandler {

    public static instance: LeiCoinNetClientsHandler;

    public readonly connections: LeiCoinNetClient[];

    private constructor() {
        this.connections = [];
    }
    
    public static getInstance() {
        if (!LeiCoinNetClientsHandler.instance) {
            LeiCoinNetClientsHandler.instance = new LeiCoinNetClientsHandler();
        }
        return LeiCoinNetClientsHandler.instance;
    }

    public async initAllClients() {
        const promises: Promise<void>[] = [];

        // Connect to other peer nodes and create peer-to-peer connections
        for (const host of config.peers) {
            promises.push(this.initClient(host));
        }
        
        await Promise.all(promises);
    }

    private async initClient(host: string) {
        const connection = new LeiCoinNetClient(host);
        await connection.connect();
        this.connections.push(connection);
    }

    public shutdown() {
        for (const connection of this.connections) {
            if (connection.isReady()) {
                connection.close();
            }
        }
    }

    public async broadcastBlock(data: any) {

        const promises: Promise<any>[] = [];

        for (const connection of this.connections) {
            promises.push(connection.sendBlock(data));
        }

        await Promise.all(promises);
    }

    public async broadcastTransaction(data: any) {

        const promises: Promise<any>[] = [];

        for (const connection of this.connections) {
            promises.push(connection.sendTransaction(data));
        }

        await Promise.all(promises);
    }

}