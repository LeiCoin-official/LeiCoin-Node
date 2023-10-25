const express = require('express');
const expressWs = require('express-ws');
const WebSocket = require('ws');
const app = express();
const expressWsInstance = expressWs(app);

// Store WebSocket connections for nodes
const nodeConnections = [];

// Configuration for other servers (nodes)
const otherServers = ["localhost:12200", "localhost:12201", "localhost:12202"];

// WebSocket route for nodes
app.ws('/node', (ws, req) => {
    // Add the WebSocket connection to the nodeConnections array
    nodeConnections.push(ws);

    // Listen for messages from clients connected to the node
    ws.on('message', (message) => {
        console.log('Received at node:', message);

        // Relay the message to all other connected nodes (except the sender)
        nodeConnections.forEach((node) => {
            if (node !== ws && node.readyState === WebSocket.OPEN) {
                node.send(message);
            }
        });
    });

    // Handle WebSocket disconnections for nodes
    ws.on('close', () => {
        // Remove the WebSocket connection from the nodeConnections array
        const index = nodeConnections.indexOf(ws);
        if (index !== -1) {
            nodeConnections.splice(index, 1);
        }
        console.log('WebSocket connection to node closed.');
    });
});

// Connect to other servers (nodes)
otherServers.forEach((serverURL) => {
    const wsclient = new WebSocket(`ws://${serverURL}/node`);
  
    wsclient.on('open', () => {
        console.log(`Connected to: ${serverURL}`);
    });
  
    wsclient.on('message', (message) => {
        console.log(`Received from ${serverURL}: ${message}`);
      
        // Relay the message to all connected nodes (except the sender)
        nodeConnections.forEach((node) => {
            if (node !== wsclient && node.readyState === WebSocket.OPEN) {
                node.send(`Received from ${serverURL}: ${message}`);
            }
        });
    });
  
    wsclient.on('close', () => {
        console.log(`Connection to ${serverURL} closed.`);
    });
});

app.listen(12210, () => {
    console.log('WebSocket server is running on port 3000');
});
