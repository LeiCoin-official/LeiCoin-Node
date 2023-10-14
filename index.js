const util = require('./src/utils');

util.sendServerLogMessage("Starting LeiCoin-Node Server ...");
require("./src/server");
util.sendServerLogMessage("LeiCoin-Node Server started");

util.sendMinerLogMessage("Starting LeiCoin-Node Miner ...");
require("./src/miner");
util.sendMinerLogMessage("LeiCoin-Node Server started");
