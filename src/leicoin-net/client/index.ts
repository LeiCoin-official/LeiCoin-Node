import WebSocket from "ws";
import utils from "../../utils/index.js";
import config from "../../handlers/configHandler.js";
import cli from "../../cli/cli.js";
import LeiCoinNetClient from "./client.js";
import LeiCoinNetClientsBasicHandler from "./basicHandler.js";

class LeiCoinNetClientsHandler extends LeiCoinNetClientsBasicHandler {

    public static instance: LeiCoinNetClientsHandler;

    private constructor() {
        super();
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

}

const leiCoinNetClientsHandler = LeiCoinNetClientsHandler.getInstance();
export default leiCoinNetClientsHandler;