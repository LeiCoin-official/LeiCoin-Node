import config from "./config/index.js";
import utils from "./utils/index.js";
import initAPI from "./api/index.js";
import initLeiCoinNetServer from "./leicoin-net/server/index.js";
import http from "http";
import WebSocket from "ws";
import cli from "./cli/cli.js";
import leiCoinNetClientsHandler from "./leicoin-net/client/index.js";

export default async function initNetConnections() {
    
    let web_server: http.Server | null = null;
    let leiCoinNetServer: WebSocket.Server;
    //let leiCoinNetClient: WebSocketClientConnection[];

    // Initialize API
    if (config.api.active) {
        web_server = http.createServer(initAPI())

        web_server.listen(config.api.port, config.api.host, () => {
            cli.api.info(`API listening on ${config.api.host}:${config.api.port}`);
        });
        cli.api.info("API started");
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

    // Listen for 'listening' event to indicate successful server start
    leiCoinNetServer.on('listening', () => {
        cli.leicoin_net.info(`LeiCoinNet-Server listening on ${config.leicoin_net.host}:${config.leicoin_net.port}`);
    });

    cli.leicoin_net.info("LeiCoinNet-Server started");

    // Initialize LeiCoinNet-Client
    //leiCoinNetClient = initLeiCoinNetClient();
    leiCoinNetClientsHandler.initAllClients();
    cli.leicoin_net.info("LeiCoinNet-Client started");

    // handle shutdown
    utils.events.once("stop_server", () => {

        // API shutdown
        if (web_server) {
            web_server.close();
            cli.api.info(`API stopped`);
        }

        // LeiCoinNet-Server shutdown
        leiCoinNetServer.close();
        cli.leicoin_net.info(`LeiCoinNet-Server stopped`);

        // LeiCoinNet-Server shutdown
        leiCoinNetClientsHandler.shutdown();
        cli.leicoin_net.info(`LeiCoinNet-Client stopped`);
    });

}
