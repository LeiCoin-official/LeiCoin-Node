import { webcrypto } from 'node:crypto'; // @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import "./src/utils/index.js";
import "./src/handlers/configHandler.js";
import "./src/storage/blockchain.js";
import initNetConnections from "./src/netInitialization.js";
import staking from "./src/validators/index.js";


initNetConnections();
staking.initIfActive();
