import WebSocket from "ws";
import utils from "../../utils/utils.js";
import config from "../../handlers/configHandler.js";
import cli from "../../utils/cli.js";

export interface WebSocketClientConnection {
    host: string;
    client: WebSocket | null;
    initialized: boolean;
}

// An array to store WebSocket connections
const wsConnections: WebSocketClientConnection[] = [];

// Function to establish a WebSocket connection to a peer server
function connectToPeer(peerConnection: WebSocketClientConnection) {
    const wsclient = new WebSocket(`ws://${peerConnection.host}/`);
    //const peerConnection = { server: peerServer, client: wsclient };

    wsclient.on('open', () => {
        cli.leicoin_net_message.client.log(`Connected to: ${peerConnection.host}`);
        peerConnection.initialized = true;
    });

    wsclient.on('error', (error) => {
        cli.leicoin_net_message.client.error(`Error connecting to ${peerConnection.host}: ${error.message}`);
    });

    wsclient.on('close', () => {
        cli.leicoin_net_message.client.log(`Connection to ${peerConnection.host} closed. Retrying on the next sending action...`);
        peerConnection.initialized = false;
    });

    peerConnection.client = wsclient;
    return peerConnection;
}

function reconnectToPeer(peerConnection: WebSocketClientConnection) {
    if (!peerConnection.client || peerConnection.client.readyState !== WebSocket.OPEN) {
        peerConnection = connectToPeer(peerConnection);
        cli.leicoin_net_message.client.log(`Retrying connection to ${peerConnection.host}`);
        return { needed: true, connection: peerConnection };
    }
    return { needed: false };
}

utils.events.on("block_receive", function (data) {
    wsConnections.forEach((peerConnection) => {
        const reconnect = reconnectToPeer(peerConnection);
        if (reconnect.needed && reconnect.connection) {
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
        if (reconnect.needed && reconnect.connection) {
            peerConnection = reconnect.connection;
            setTimeout(() => {
                sendTransaction(peerConnection, data);
            }, 2000); // Wait for 2 seconds before sending data
        } else {
            sendTransaction(peerConnection, data);
        }
    });
});

function sendBlock(peerConnection: WebSocketClientConnection, data: any) {
    if (peerConnection.client && peerConnection.client.readyState === WebSocket.OPEN) {
        try {
            peerConnection.client.emit("block", data);
            //cli.ws_client_message.log(`Data sent to ${peerConnection.server}: ${data}`);
            cli.leicoin_net_message.client.log(`Block sent to ${peerConnection.host}`);
        } catch (err: any) {
            cli.leicoin_net_message.client.error(`Error sending Block to ${peerConnection.host}: ${err.message}`);
        }
    } else {
        //cli.ws_client_message.log(`Waiting to send data to ${peerConnection.server}...`);
    }
}

function sendTransaction(peerConnection: WebSocketClientConnection, data: any) {
    if (peerConnection.client && peerConnection.client.readyState === WebSocket.OPEN) {
        try {
            peerConnection.client.emit("transaction", data);
            //cli.ws_client_message.log(`Data sent to ${peerConnection.server}: ${data}`);
            cli.leicoin_net_message.client.log(`Transaction sent to ${peerConnection.host}`);
        } catch (err: any) {
            cli.leicoin_net_message.client.error(`Error sending Transaction to ${peerConnection.host}: ${err.message}`);
        }
    } else {
        //cli.ws_client_message.log(`Waiting to send data to ${peerConnection.server}...`);
    }
}

export function initLeiCoinNetClient() {
    // Connect to other peer nodes and create peer-to-peer connections
    config.peers.forEach((host: string) => {
        const peerConnection = connectToPeer({
            host: host,
            client: null,
            initialized: false,
        }); 
        wsConnections.push(peerConnection);
    });

    return wsConnections;
}

export function shutdownLeiCoinNetClient() {
    wsConnections.forEach(connection => {
        if (connection.initialized) {
            connection.client?.close(1000);
        }
    });
}
