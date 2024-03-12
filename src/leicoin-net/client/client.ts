import WebSocket from "ws";
import cli from "../../utils/cli.js";
import { Callbacks } from "../../utils/callbacks.js";

// export interface LeiCoinNetClientLike {}

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
        this.client = new WebSocket(`ws://${this.host}/`);
    
        this.client.on('open', () => {
            cli.leicoin_net_message.client.log(`Connected to: ${this.host}`);
            this.ready = true;
        });
    
        this.client.on('error', (error: any) => {
            cli.leicoin_net_message.client.error(`Error connecting to ${this.host}: ${error.message}`);
        });
    
        this.client.on('close', (code: number) => {
            if (code !== 1000) {
                cli.leicoin_net_message.client.log(`Connection to ${this.host} closed. Exit-Code: ${code}`);
            }
            this.ready = false;
        });
    }

    public close(code = 1000) {
        this.client?.close(code);
    }


    public async sendBlock(data: any) {
        if (this.ready && this.client) {
            try {
                this.client.send(data);
                cli.leicoin_net_message.client.log(`Block sent to ${this.host}`);
                return Callbacks.SUCCESS;
            } catch (err: any) {
                cli.leicoin_net_message.client.error(`Error sending Block to ${this.host}: ${err.message}`);
            }
        } else {
            await this.connect();
            // Wait for 2 seconds before sending data
            setTimeout(() => {
                return this.sendBlock(data);
            }, 2000);
        }
        return Callbacks.ERROR;
    }

    public async sendTransaction(data: any) {
        if (this.ready && this.client) {
            try {
                this.client.send(data);
                cli.leicoin_net_message.client.log(`Transaction sent to ${this.host}`);
                return Callbacks.SUCCESS;
            } catch (err: any) {
                cli.leicoin_net_message.client.error(`Error sending Transaction to ${this.host}: ${err.message}`);
            }
        } else {
            await this.connect();
            // Wait for 2 seconds before sending data
            setTimeout(() => {
                return this.sendTransaction(data);
            }, 2000);
        }
        return Callbacks.ERROR;
    }

    public getClient() {
        return this.client;
    }

    public isReady() {
        return this.ready;
    }

}

export default LeiCoinNetClient;