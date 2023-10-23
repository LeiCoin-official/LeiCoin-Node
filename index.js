


const util = require('./src/utils');
const { createStorageIfNotExists } = require('./src/handlers/dataHandler');

createStorageIfNotExists();

util.server_message.log("Starting LeiCoin-Node Server ...");
require("./src/server");
util.server_message.log("LeiCoin-Node Server started");

// util.ws_client_message.log("Starting LeiCoin-Node WS ...");
// require("./src/ws-client");
// util.ws_client_message.log("LeiCoin-Node WS Client started");

util.miner_message.log("Starting LeiCoin-Node Miner ...");
require("./src/miner");
util.miner_message.log("LeiCoin-Node Miner started");   

