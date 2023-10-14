const util = require('./src/utils');
const { createStorageIfNotExists } = require('./src/handlers/dataHandler');

createStorageIfNotExists();

util.api_message.log("Starting LeiCoin-Node API ...");
require("./src/api");
util.api_message.log("LeiCoin-Node API started");

util.ws_message.log("Starting LeiCoin-Node WebSocket ...");
require("./src/websocket");
util.ws_message.log("LeiCoin-Node WebSocket started");

util.miner_message.log("Starting LeiCoin-Node Miner ...");
require("./src/miner");
util.miner_message.log("LeiCoin-Node Miner started");

