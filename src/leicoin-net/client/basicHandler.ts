import LeiCoinNetClient from "./client.js";

export default class LeiCoinNetClientsBasicHandler {

    public readonly connections: LeiCoinNetClient[];

    protected constructor() {
        this.connections = [];
    }

    protected async initClient(host: string) {
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

    public async broadcastData(data: Buffer) {

        const promises: Promise<any>[] = [];

        for (const connection of this.connections) {
            promises.push(connection.sendData(data));
        }

        await Promise.all(promises);
    }

}
