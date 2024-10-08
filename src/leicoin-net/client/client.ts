import WebSocket from "ws";
import cli from "../../cli/cli.js";
import { CB } from "../../utils/callbacks.js";

// export class LeiCoinNetClient {
export class LeiCoinNetClient {

    private readonly host: string;
    private client: WebSocket | null;
    private ready: boolean;

    constructor(host: string) {
        this.host = host;
        this.ready = false;
        this.client = null;
    }

    public async connect() {
        this.client = new WebSocket(this.host);
    
        this.client.on('open', () => {
            cli.leicoin_net.info(`Connected to: ${this.host}`);
            this.ready = true;
        });
    
        this.client.on('error', (error: any) => {
            cli.leicoin_net.error(`Error connecting to ${this.host}: ${error.stack}`);
        });
    
        this.client.on('close', (code: number) => {
            if (code !== 1000) {
                cli.leicoin_net.info(`Connection to ${this.host} closed. Exit-Code: ${code}`);
            }
            this.ready = false;
        });
    }

    public close(code = 1000) {
        this.client?.close(code);
    }

    public async sendData(data: Buffer, trys = 1) {
        if (this.ready && this.client) {
            try {
                this.client.send(data);
                //cli.leicoin_net.info(`Data sent to ${this.host}`);
                return CB.SUCCESS;
            } catch (err: any) {
                cli.leicoin_net.error(`Error sending Binary Data to ${this.host}: ${err.stack}`);
            }
        } else if (trys > 0) {
            await this.connect();
            // Wait for 2 seconds before sending data
            setTimeout(() => {
                return this.sendData(data, 0);
            }, 2000);
        }
        return CB.ERROR;
    }

    public getClient() {
        return this.client;
    }

    public isReady() {
        return this.ready;
    }

}

export default LeiCoinNetClient;