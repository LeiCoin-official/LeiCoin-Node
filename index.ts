import "./src/utils/utils.js";
import "./src/handlers/configHandler.js";
import "./src/handlers/storage/blockchain.js";
import initNetConnections from "./src/netInitialization.js";
import initMinerIfActive from "./src/miner/index.js";

initNetConnections();
initMinerIfActive();
