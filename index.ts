import "./src/utils/utils.js";
import "./src/handlers/configHandler.js";
import "./src/storage/blockchain.js";
import initNetConnections from "./src/netInitialization.js";
import staking from "./src/staking/index.js";


initNetConnections();
staking.initIfActive();
