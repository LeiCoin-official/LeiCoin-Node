const express = require('express');
const expressWS = require('express-ws');
const bodyParser = require('body-parser');
const config = require('../handlers/configHandler');
const cors = require('cors');
const util = require('../utils');
const WebSocket = require('ws');

const app = express();

expressWS(app);

app.use(cors());
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const transactionRouter = require('./routes/sendTransactions')
//const blocksRouter = require('./routes/sendBlocks');

app.use('/api/sendtransactions', transactionRouter);
//app.use('/api/sendblocks', blocksRouter);

// Create a route that upgrades to WebSocket
app.ws('/ws', (ws, req) => {
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
    otherServers.forEach((serverURL) => {
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

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(config.server.port, () => {
    util.server_message.log(`Server listening on port ${config.server.port}`);
});
