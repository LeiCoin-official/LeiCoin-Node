const WebSocket = require('ws');
const util = require('../../utils');
const config = require('../../handlers/configHandler');

// Function to establish a WebSocket connection to a peer server
function connectToPeer(peerServer) {
    const wsclient = new WebSocket(`ws://${peerServer}/ws`);

    wsclient.on('open', () => {
        console.log(`Connected to: ${peerServer}`);
    });

    wsclient.on('close', () => {
        console.log(`Connection to ${peerServer} closed. Retrying on the next block send...`);
    });

    util.events.on("block_receive", function (data) {
        util.events.emit("ws_reconnect");
        wsclient.send(data);
    });

    util.events.on("transaction_receive", function (data) {
        util.events.emit("ws_reconnect");
        wsclient.send(data);
    });

    return wsclient;
}

// Connect to other peer nodes and create peer-to-peer connections
config.peers.forEach((server) => {
    let wsclient = connectToPeer(server);

    // Retry the connection on the next block send
    util.events.on("ws_reconnect", function () {
        if (wsclient.readyState !== WebSocket.OPEN) {
            console.log(`Retrying connection to ${server}`);
            wsclient = connectToPeer(server);
        }
    });
});
