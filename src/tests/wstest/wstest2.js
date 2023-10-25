const express = require('express');
const expressWs = require('express-ws');
const WebSocket = require('ws');
const app = express();
const expressWsInstance = expressWs(app);

// Store WebSocket connections for nodes
const nodeConnections = [];

// Configuration for other servers (nodes)
const otherServers = [
    { name: 'node1', port: 12210 },
    { name: 'node3', port: 12212 },
];

// WebSocket route for nodes
app.ws('/node', (ws, req) => {
    // Add the WebSocket connection to the nodeConnections array
    nodeConnections.push(ws);

    // Listen for messages from clients connected to the node
    ws.on('message', (message) => {
        console.log(`Received at ${req.baseUrl}: ${message}`);

        // Relay the message to all other connected nodes (except the sender)
        nodeConnections.forEach((node) => {
            if (node !== ws && node.readyState === WebSocket.OPEN) {
                node.send(`Relayed from ${req.baseUrl}: ${message}`);
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
        console.log(`WebSocket connection to ${req.baseUrl} closed.`);
    });
});

// Connect to other servers (nodes) and create peer-to-peer connections
otherServers.forEach((server) => {
    const wsclient = new WebSocket(`ws://localhost:${server.port}/node`);
  
    wsclient.on('open', () => {
        console.log(`Connected to: ${server.name}`);
    });
  
    wsclient.on('message', (message) => {
        console.log(`Received from ${server.name}: ${message}`);
      
        // Relay the message to all connected nodes (except the sender)
        nodeConnections.forEach((node) => {
            if (node !== wsclient && node.readyState === WebSocket.OPEN) {
                node.send(`Relayed from ${server.name}: ${message}`);
            }
        });
    });
  
    wsclient.on('close', () => {
        console.log(`Connection to ${server.name} closed.`);
    });
});

app.listen(12211, () => {
    console.log('WebSocket server is running on port 12211');
});
