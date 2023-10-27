const WebSocket = require('ws');
const util = require('../../utils');
const config = require('../../handlers/configHandler');

// Function to establish a WebSocket connection to a peer server
function connectToPeer(peerServer) {
    const wsclient = new WebSocket(`ws://${peerServer}/ws`);

    wsclient.on('open', () => {
        util.ws_client_message.log(`Connected to: ${peerServer}`);
    });

    wsclient.on('error', (error) => {
        util.ws_client_message.log(`Error connecting to ${peerServer}: ${error.message}`);
        //util.events.emit("ws_reconnect");
    });

    wsclient.on('close', () => {
        util.ws_client_message.log(`Connection to ${peerServer} closed. Retrying on the next block send...`);
        //util.events.emit("ws_reconnect");
    });

    util.events.on("block_receive", function (data) {
        try {
            wsclient.send(data);
        } catch (err) {
            util.ws_client_message.error(`Error sending Block to ${peerServer}: ${err.message}`);
        }
    });

    util.events.on("transaction_receive", function (data) {
        try {
            wsclient.send(data);
        } catch (err) {
            util.ws_client_message.error(`Error sending Transaction to ${peerServer}: ${err.message}`);
        }
    });

    return wsclient;
}

// Connect to other peer nodes and create peer-to-peer connections
config.peers.forEach((server) => {
    let wsclient = connectToPeer(server);

    // Retry the connection on the next block send
    util.events.on("ws_reconnect", function () {
        if (wsclient.readyState !== WebSocket.OPEN) {
            util.ws_client_message.log(`Retrying connection to ${server}`);
            wsclient = connectToPeer(server);
        }
    });
});
