const express = require('express');
const router = express.Router();
const WebSocket = require('ws');

// Create a route that upgrades to WebSocket
router.ws('/', (ws, req) => {
    // Handle WebSocket connections here
  
    // Listen for messages from the client
    ws.on('message', (message) => {
		console.log('Received:', message);
	
		// Send a response back to the client
		ws.send('Hello, WebSocket client!');
    });
  
    // Handle WebSocket disconnections
    ws.on('close', () => {
      	console.log('WebSocket connection closed.');
    });
  
    // Connect to other servers on server startup
    util.peers.forEach((serverURL) => {
		const wsclient = new WebSocket(serverURL);
	
		wsclient.on('open', () => {
			console.log(`Connected to: ${serverURL}`);
		});
	
		wsclient.on('message', (message) => {
			console.log(`Received from ${serverURL}: ${message}`);
		});
	
		wsclient.on('close', () => {
			console.log(`Connection to ${serverURL} closed.`);
		});
    });
});

//router.use('/sendtransactions', require('./sendTransactions'));

module.exports = router;