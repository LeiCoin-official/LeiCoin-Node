const util = require('./src/utils');

util.server_message.log("Starting LeiCoin-Node Server ...");
require("./src/server");
util.server_message.log("LeiCoin-Node Server started");

util.miner_message.log("Starting LeiCoin-Node Miner ...");
require("./src/miner");
util.miner_message.log("LeiCoin-Node Server started");
