import WebSocket from "ws";
import utils from "../../utils.js";
import config from "../../handlers/configHandler.js";

// An array to store WebSocket connections
const wsConnections = [];

// Function to establish a WebSocket connection to a peer server
function connectToPeer(peerServer) {
    const wsclient = new WebSocket(`ws://${peerServer}/ws`);
    //const peerConnection = { server: peerServer, client: wsclient };

    wsclient.on('open', () => {
        utils.ws_client_message.log(`Connected to: ${peerServer}`);
    });

    wsclient.on('error', (error) => {
        utils.ws_client_message.error(`Error connecting to ${peerServer}: ${error.message}`);
    });

    wsclient.on('close', () => {
        utils.ws_client_message.log(`Connection to ${peerServer} closed. Retrying on the next sending action...`);
        //reconnectToPeer(peerConnection);
    });

    //wsConnections.push(peerConnection);

    return wsclient;
}

function reconnectToPeer(peerConnection) {
    if (peerConnection.client.readyState !== WebSocket.OPEN) {
        peerConnection.client = connectToPeer(peerConnection.server);
        utils.ws_client_message.log(`Retrying connection to ${peerConnection.server}`);
        return { needed: true, connection: peerConnection };
    }
    return { needed: false };
}

// Connect to other peer nodes and create peer-to-peer connections
config.peers.forEach((server) => {
    let wsclient = connectToPeer(server);
    wsConnections.push({
        server: server,
        client: wsclient
    })
});

utils.events.on("block_receive", function (data) {
    wsConnections.forEach((peerConnection) => {
        const reconnect= reconnectToPeer(peerConnection);
        if (reconnect.needed) {
            peerConnection = reconnect.connection;
            setTimeout(() => {
                sendBlock(peerConnection, data);
            }, 2000); // Wait for 2 seconds before sending data
        } else {
            sendBlock(peerConnection, data);
        }
    });
});

utils.events.on("transaction_receive", function (data) {
    wsConnections.forEach((peerConnection) => {
        const reconnect = reconnectToPeer(peerConnection);
        if (reconnect.needed) {
            peerConnection = reconnect.connection;
            setTimeout(() => {
                sendTransaction(peerConnection, data);
            }, 2000); // Wait for 2 seconds before sending data
        } else {
            sendTransaction(peerConnection, data);
        }
    });
});

function sendBlock(peerConnection, data) {
    if (peerConnection.client.readyState === WebSocket.OPEN) {
        try {
            peerConnection.client.send(data);
            //utils.ws_client_message.log(`Data sent to ${peerConnection.server}: ${data}`);
            utils.ws_client_message.log(`Block sent to ${peerConnection.server}`);
        } catch (err) {
            utils.ws_client_message.error(`Error sending Block to ${peerConnection.server}: ${err.message}`);
        }
    } else {
        //utils.ws_client_message.log(`Waiting to send data to ${peerConnection.server}...`);
    }
}

function sendTransaction(peerConnection, data) {
    if (peerConnection.client.readyState === WebSocket.OPEN) {
        try {
            peerConnection.client.send(data);
            //utils.ws_client_message.log(`Data sent to ${peerConnection.server}: ${data}`);
            utils.ws_client_message.log(`Transaction sent to ${peerConnection.server}`);
        } catch (err) {
            utils.ws_client_message.error(`Error sending Transaction to ${peerConnection.server}: ${err.message}`);
        }
    } else {
        //utils.ws_client_message.log(`Waiting to send data to ${peerConnection.server}...`);
    }
}
