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
        peerConnection.isConnected = true; // Mark the connection as open
    });

    wsclient.on('error', (error) => {
        util.ws_client_message.error(`Error connecting to ${peerServer}: ${error.message}`);
        peerConnection.isConnected = false; // Mark the connection as closed
    });

    wsclient.on('close', () => {
        util.ws_client_message.log(`Connection to ${peerServer} closed. Retrying on the next sending action...`);
        peerConnection.isConnected = false; // Mark the connection as closed
        reconnectToPeer(peerConnection);
    });

    wsConnections.push(peerConnection);

    return wsclient;
}

function reconnectToPeer(peerConnection) {
    if (peerConnection.client.readyState !== WebSocket.OPEN) {
        if (!peerConnection.isReconnecting) {
            util.ws_client_message.log(`Retrying connection to ${peerConnection.server}`);
            peerConnection.isReconnecting = true;

            const interval = setInterval(() => {
                if (peerConnection.isConnected) {
                    clearInterval(interval); // Reconnection successful, clear the interval
                    peerConnection.isReconnecting = false;
                }
            }, 1000); // Wait for 1 second before retrying
        }
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
