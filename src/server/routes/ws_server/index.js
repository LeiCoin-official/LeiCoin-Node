const express = require('express');
const router = express.Router();
const util = require('../../../utils');
const block_receive_job = require('./block_receive');

// WebSocket route for nodes
router.ws('/', (ws, req) => {
    // Add the WebSocket connection to the nodeConnections array

    // Listen for messages from clients connected to the node
    ws.on('message', (data) => {

        // Relay the message to all other connected nodes (except the sender)
        if (data.type === "block") {
			block_receive_job(data.block);
            util.events.emit("block_receive", data);
        }

		if (data.type === "transaction") {
			block_receive_job(data.transaction);
            util.events.emit("transaction_receive", data);
        }

    });

    // Handle WebSocket disconnections for nodes
    ws.on('close', () => {
        // Remove the WebSocket connection from the nodeConnections array
        const index = nodeConnections.indexOf(ws);
        if (index !== -1) {
            nodeConnections.splice(index, 1);
        }
        console.log(`WebSocket connection to ${req.baseUrl} closed.`);
    });
});


module.exports = router;