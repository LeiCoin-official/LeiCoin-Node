import express from 'express';
import expressWs from 'express-ws';
import WebSocket from 'ws';
const app = express();
const expressWsInstance = expressWs(app);
import { EventEmitter } from "events";
const events = new EventEmitter();

const self_node_name = "node1";

// Store WebSocket connections for nodes
const nodeConnections = [];


// Configuration for other servers (nodes)
const otherServers = [
    { name: 'node2', port: 12211 },
    { name: 'node3', port: 12212 },
];

const receivedData = [];

// WebSocket route for nodes
app.ws('/node', (ws, req) => {
    // Add the WebSocket connection to the nodeConnections array
    //nodeConnections.push(ws);

    // Listen for messages from clients connected to the node
    ws.on('message', (message) => {

        // Relay the message to all other connected nodes (except the sender)
        /*nodeConnections.forEach((node) => {
            if (node !== ws && node.readyState === WebSocket.OPEN) {
                node.send(`Relayed from ${req.baseUrl}: ${message}`);
            }
        });*/

        if (!receivedData.includes(message)) {
            receivedData.push(message);
            console.log(`${self_node_name}: Received message: ${message}`);
            events.emit("smm", message);
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

// Connect to other servers (nodes) and create peer-to-peer connections
otherServers.forEach((server) => {
    const wsclient = new WebSocket(`ws://localhost:${server.port}/node`);
  
    wsclient.on('open', () => {
        console.log(`${self_node_name} Connected to: ${server.name}`);
    });
  
    /*wsclient.on('message', (message) => {
        console.log(`${self_node_name}: Received from ${server.name}: ${message}`);
      
        // Relay the message to all connected nodes (except the sender)
        nodeConnections.forEach((node) => {
            if (node !== wsclient && node.readyState === WebSocket.OPEN) {
                node.send(`${self_node_name}: Relayed from ${server.name}: ${message}`);
            }
        });
    });*/
    events.on("smm", function (data) {
        wsclient.send(data);
    });
  
    wsclient.on('close', () => {
        console.log(`${self_node_name}: Connection to ${server.name} closed.`);
    });
});

app.listen(12210, () => {
    console.log(`${self_node_name}: WebSocket server is running on port 12210`);
});


setTimeout(
    function() {
        message = `${self_node_name}: Hello Peers`;
        receivedData.push(message);
        events.emit("smm", message);
    }, 5000
);