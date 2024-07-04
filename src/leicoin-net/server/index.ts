import cli from "../../cli/cli.js";
import WebSocket, { WebSocketServer } from "ws";
import pipelines from "../pipelines/index.js";

const nodeConnections: WebSocket[] = [];

export default function initLeiCoinNetServer(options: WebSocket.ServerOptions) {

    const websocket_server = new WebSocketServer(options);

    websocket_server.on('connection', (ws, req) => {

        nodeConnections.push(ws);

        cli.leicoin_net.server.info(`${req.socket.remoteAddress}:${req.socket.remotePort} established as connection to this Server.`);

        // Listen for messages from clients connected to the node
        ws.on('message', async (rawdata: Buffer, isBinary) => {

            if (isBinary) {
                pipelines.receiveData(rawdata);
            }

        });

        ws.on('error', (error) => {
            cli.leicoin_net.server.info(`Websocket Server Error: ${error.message}`);
            //utils.events.emit("ws_reconnect");
        });

        // Handle WebSocket disconnections for nodes
        ws.on('close', () => {
            // Remove the WebSocket connection from the nodeConnections array
            const index = nodeConnections.indexOf(ws);
            if (index !== -1) {
                nodeConnections.splice(index, 1);
            }
            cli.leicoin_net.server.info(`WebSocket connection to ${req.headers.host} closed.`);
        });
        
    });

    return websocket_server;

}
