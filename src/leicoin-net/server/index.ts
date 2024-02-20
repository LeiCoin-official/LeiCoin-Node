import utils from "../../utils/utils.js";
import cli from "../../utils/cli.js";
import block_receive_job from "./block_receive.js";
import transactions_receive_job from "./transactions_receive.js";
import WebSocket, { WebSocketServer } from "ws";

const nodeConnections: WebSocket[] = [];

export default function initLeiCoinNetServer(options: WebSocket.ServerOptions) {

    const websocket_server = new WebSocketServer(options);

    websocket_server.on('connection', (ws, req) => {

        nodeConnections.push(ws);

        cli.leicoin_net_message.server.log(`${req.headers.host} established as connection to this Server.`);

        // Listen for messages from clients connected to the node
        ws.on('block', (blockData) => {
            const block_receive_job_result = block_receive_job(blockData);
            if (block_receive_job_result.cb) {
                utils.events.emit("block_receive", blockData);
            }
        });

        ws.on('transaction', (transactionData) => {
            const transactions_receive_job_result = transactions_receive_job(transactionData);
            if (transactions_receive_job_result.cb) {
                utils.events.emit("transaction_receive", transactionData);
            }
        });

        ws.on('error', (error) => {
            cli.leicoin_net_message.server.log(`Websocket Server Error: ${error.message}`);
            //utils.events.emit("ws_reconnect");
        });

        // Handle WebSocket disconnections for nodes
        ws.on('close', () => {
            // Remove the WebSocket connection from the nodeConnections array
            const index = nodeConnections.indexOf(ws);
            if (index !== -1) {
                nodeConnections.splice(index, 1);
            }
            cli.leicoin_net_message.server.log(`WebSocket connection to ${req.headers.host} closed.`);
        });
        
    });

    return websocket_server;

}
