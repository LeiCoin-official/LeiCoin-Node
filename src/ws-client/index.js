const config = require('../handlers/configHandler');
const WebSocket = require('ws');

const socket = new WebSocket(`ws://0.0.0.0:${config.server.port}/ws`);

socket.on('open', () => {
  console.log('Connected to the server.');

  // Handle incoming messages from the server
  socket.on('message', (message) => {
    console.log('Received:', message);
  });

  // Send a message to all connected peers
  const message = 'Hello, peers!';
  config.peers.forEach((peerHost) => {
    const peerURL = `ws://${peerHost}/ws`;
    const peerSocket = new WebSocket(peerURL);

    peerSocket.on('open', () => {
      console.log(`Connected to peer at ${peerURL}`);
      peerSocket.send(message);
    });

    peerSocket.on('message', (peerMessage) => {
      console.log(`Received from ${peerURL}: ${peerMessage}`);
    });

    peerSocket.on('close', () => {
      console.log(`Connection to peer at ${peerURL} closed.`);
    });
  });
});

socket.on('close', () => {
  console.log('Connection to the server closed.');
});
