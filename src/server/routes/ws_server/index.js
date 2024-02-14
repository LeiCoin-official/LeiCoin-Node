const express = require('express');
const router = express.Router();
const util = require('../../../utils');
const block_receive_job = require('./block_receive');
const transactions_receive_job = require('./transactions_receive');


const nodeConnections = [];

// WebSocket route for nodes
router.ws('/', (ws, req) => {
    // Add the WebSocket connection to the nodeConnections array

    nodeConnections.push(ws);

    // Listen for messages from clients connected to the node
    ws.on('message', (data) => {

        decodedData = JSON.parse(data);

        //util.server_message.log(`Received ${data}`);

        // Relay the message to all other connected nodes (except the sender)
        if (decodedData.type === "block") {
			const block_receive_job_result = block_receive_job(decodedData.data);
            if (block_receive_job_result.cb) {
                util.events.emit("block_receive", data);
            }
        }

		if (decodedData.type === "transaction") {
			const transactions_receive_job_result = transactions_receive_job(decodedData.data);
            if (transactions_receive_job_result.cb) {
                util.events.emit("transaction_receive", data);
            }
        }

    });

    ws.on('error', (error) => {
        util.server_message.log(`WS Server Error: ${error.message}`);
        //util.events.emit("ws_reconnect");
    });

    // Handle WebSocket disconnections for nodes
    ws.on('close', () => {
        // Remove the WebSocket connection from the nodeConnections array
        const index = nodeConnections.indexOf(ws);
        if (index !== -1) {
            nodeConnections.splice(index, 1);
        }
        util.server_message.log(`WebSocket connection to ${req.baseUrl} closed.`);
    });
});


module.exports = router;
