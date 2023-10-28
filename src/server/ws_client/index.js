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
        //reconnectToPeer(peerConnection);
    });

    wsConnections.push(peerConnection);

    return wsclient;
}

function reconnectToPeer(peerConnection) {
    if (peerConnection.client.readyState !== WebSocket.OPEN) {
        peerConnection.client = connectToPeer(peerConnection.server);
        util.ws_client_message.log(`Retrying connection to ${peerConnection.server}`);
    }
}

// Connect to other peer nodes and create peer-to-peer connections
config.peers.forEach((server) => {
    let wsclient = connectToPeer(server);
});

util.events.on("block_receive", function (data) {
    wsConnections.forEach((peerConnection) => {
        reconnectToPeer(peerConnection);
        setTimeout(() => {
            if (peerConnection.client.readyState === WebSocket.OPEN) {
                try {
                    peerConnection.client.send(data);
                    util.ws_client_message.log(`Data sent to ${peerConnection.server}: ${data}`);
                } catch (err) {
                    util.ws_client_message.error(`Error sending Block to ${peerConnection.server}: ${err.message}`);
                }
            } else {
                util.ws_client_message.log(`Waiting to send data to ${peerConnection.server}...`);
            }
        }, 5000); // Wait for 5 seconds before sending data
    });
});

util.events.on("transaction_receive", function (data) {
    wsConnections.forEach((peerConnection) => {
        reconnectToPeer(peerConnection);
        setTimeout(() => {
            if (peerConnection.client.readyState === WebSocket.OPEN) {
                try {
                    peerConnection.client.send(data);
                    util.ws_client_message.log(`Data sent to ${peerConnection.server}: ${data}`);
                } catch (err) {
                    util.ws_client_message.error(`Error sending Transaction to ${peerConnection.server}: ${err.message}`);
                }
            } else {
                util.ws_client_message.log(`Waiting to send data to ${peerConnection.server}...`);
            }
        }, 5000); // Wait for 5 seconds before sending data
    });
});
