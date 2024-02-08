import utils from "./src/utils.js";
import "./src/handlers/storage/blockchain.js";

utils.server_message.log("Starting LeiCoin-Node Server ...");
import "./src/server/index.js";
utils.server_message.log("LeiCoin-Node Server started");

// utils.ws_client_message.log("Starting LeiCoin-Node WS ...");
// require("./src/ws-client");
// utils.ws_client_message.log("LeiCoin-Node WS Client started");

utils.miner_message.log("Starting LeiCoin-Node Miner ...");
import "./src/miner/index.js";
utils.miner_message.log("LeiCoin-Node Miner started");   

