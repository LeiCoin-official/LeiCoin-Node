import "./src/utils/index.js";
import "./src/handlers/configHandler.js";
import "./src/storage/blockchain.js";
import initNetConnections from "./src/netInitialization.js";
import staking from "./src/validators/index.js";


initNetConnections();
staking.initIfActive();
