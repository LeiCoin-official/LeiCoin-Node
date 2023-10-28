const WebSocket = require('ws');
const util = require('../../utils');
const config = require('../../handlers/configHandler');

// An array to store WebSocket connections
const wsConnections = [];

// Function to establish a WebSocket connection to a peer server
function connectToPeer(peerServer) {
    const wsclient = new WebSocket(`ws://${peerServer}/ws`);
    const peerConnection = { server: peerServer, client: wsclient };

    wsclient.on('open', () => {
        util.ws_client_message.log(`Connected to: ${peerServer}`);
    });

    wsclient.on('error', (error) => {
        util.ws_client_message.error(`Error connecting to ${peerServer}: ${error.message}`);
    });

    wsclient.on('close', () => {
        util.ws_client_message.log(`Connection to ${peerServer} closed. Retrying on the next sending action...`);
        reconnectToPeer(peerConnection);
    });

    wsConnections.push(peerConnection);

    return wsclient;
}

function reconnectToPeer(peerConnection) {
    // Retry the connection on the next block or transaction send
    if (peerConnection.client.readyState !== WebSocket.OPEN) {
        util.ws_client_message.log(`Retrying connection to ${peerConnection.server}`);
        peerConnection.client = connectToPeer(peerConnection.server);
    }
}

// Connect to other peer nodes and create peer-to-peer connections
config.peers.forEach((server) => {
    let wsclient = connectToPeer(server);
});

util.events.on("block_receive", function (data) {
    wsConnections.forEach((peerConnection) => {
        reconnectToPeer(peerConnection);
        try {
            peerConnection.client.send(data);
        } catch (err) {
            util.ws_client_message.error(`Error sending Block to ${peerConnection.server}: ${err.message}`);
        }
    });
});

util.events.on("transaction_receive", function (data) {
    wsConnections.forEach((peerConnection) => {
        reconnectToPeer(peerConnection);
        try {
            peerConnection.client.send(data);
        } catch (err) {
            util.ws_client_message.error(`Error sending Transaction to ${peerConnection.server}: ${err.message}`);
        }
    });
});
