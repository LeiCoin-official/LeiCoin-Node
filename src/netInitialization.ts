import config from "./handlers/configHandler.js";
import utils from "./utils.js";
import initAPI from "./api/index.js";
import initLeiCoinNetClient, { WebSocketClientConnection } from "./leicoin-net/client/index.js";
import initLeiCoinNetServer from "./leicoin-net/server/index.js";
import http from "http";
import WebSocket from "ws";

export default async function initNetConnections() {
    
    let web_server: http.Server | null = null;
    let leiCoinNetServer: WebSocket.Server;
    let leiCoinNetClient: WebSocketClientConnection[];

    // Initialize API
    if (config.api.active) {
        web_server = http.createServer(initAPI())

        web_server.listen(config.server.port, config.api.host, () => {
            utils.api_message.log(`API listening on ${config.api.host}:${config.api.port}`);
        });
        utils.api_message.log("API started");
    }

    // Initialize LeiCoinNet-Server
    if (
        web_server &&
        (config.api.host === config.leicoin_net.host) &&
        (config.api.port === config.leicoin_net.port)
    )
        leiCoinNetServer = initLeiCoinNetServer({ server: web_server });
    else
        leiCoinNetServer = initLeiCoinNetServer({ port: config.leicoin_net.port, host: config.leicoin_net.host });

    utils.leicoin_net_message.server.log("LeiCoinNet-Server started");

    // Initialize LeiCoinNet-Client
    leiCoinNetClient = initLeiCoinNetClient();
    utils.leicoin_net_message.client.log("LeiCoinNet-Client started");

    // handle shutdown
    utils.events.once("stop_server", function() {

        // API shutdown
        if (web_server) {
            web_server.close();
            utils.api_message.log(`API stopped`);
        }

        // LeiCoinNet-Server shutdown
        leiCoinNetServer.close();
        utils.leicoin_net_message.server.log(`LeiCoinNet-Server stopped`);

        // LeiCoinNet-Server shutdown
        leiCoinNetClient.forEach(connection => {
            connection.client?.close();
        });
        utils.leicoin_net_message.server.log(`LeiCoinNet-Server stopped`);
    });

}
