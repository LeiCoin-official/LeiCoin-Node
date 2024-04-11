import "./utils/index.js";
import "./handlers/configHandler.js";
import "./storage/blockchain.js";
import initNetConnections from "./netInitialization.js";
import staking from "./validators/index.js";


initNetConnections();
staking.initIfActive();
