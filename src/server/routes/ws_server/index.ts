import express from "express";
import utils from "../../../utils.js";
import block_receive_job from "./block_receive.js";
import transactions_receive_job from "./transactions_receive.js";

const router = express.Router();


const nodeConnections = [];

// WebSocket route for nodes
router.ws('/', (ws, req) => {
    // Add the WebSocket connection to the nodeConnections array

    nodeConnections.push(ws);

    // Listen for messages from clients connected to the node
    ws.on('message', (data) => {

        decodedData = JSON.parse(data);

        //utils.server_message.log(`Received ${data}`);

        // Relay the message to all other connected nodes (except the sender)
        if (decodedData.type === "block") {
			const block_receive_job_result = block_receive_job(decodedData.data);
            if (block_receive_job_result.cb) {
                utils.events.emit("block_receive", data);
            }
        }

		if (decodedData.type === "transaction") {
			const transactions_receive_job_result = transactions_receive_job(decodedData.data);
            if (transactions_receive_job_result.cb) {
                utils.events.emit("transaction_receive", data);
            }
        }

        if (decodedData.type === "update_request") {
			
        }

    });

    wsclient.on('error', (error) => {
        utils.server_message.log(`WS Server Error: ${error.message}`);
        //utils.events.emit("ws_reconnect");
    });

    // Handle WebSocket disconnections for nodes
    ws.on('close', () => {
        // Remove the WebSocket connection from the nodeConnections array
        const index = nodeConnections.indexOf(ws);
        if (index !== -1) {
            nodeConnections.splice(index, 1);
        }
        utils.server_message.log(`WebSocket connection to ${req.baseUrl} closed.`);
    });
});

