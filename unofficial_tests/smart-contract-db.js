import { Level } from "level";
import LevelDB from "../build/src/storage/leveldb.js";
import crypto from 'crypto';
import path from "path";
import { shuffleArray } from './cryptoUtils.js';
import { startTimer, endTimer } from "./testUtils.js";
import { Uint, Uint256, Uint64 } from "../build/src/utils/binary.js";
import Crypto from "../build/src/crypto/index.js";
import { PX } from "../build/src/objects/prefix.js";
import { AddressHex } from "../build/src/objects/address.js";
import { PublicKey } from "../build/src/crypto/cryptoKeys.js";

async function gen(size, db = "smart-contract") {

    const level = await openDB(db);
    
    const validator_preifx = PX.A_0e;
    const metaDataPrefix = PX.META;

    const validators = [];

    for (let i = 0; i < size; i++) {
        validators.push(Uint.concat([
            // Index
            Uint64.from(i),

            // Validator Public Key
            new PublicKey(crypto.randomBytes(33)),

            // Withdraw Address
            new AddressHex(crypto.randomBytes(21)).getBody(),

            // Stake Amount
            new Uint64.from(32_0000_0000)
            
        ]));
    }

    // length
    level.put(Uint.concat([metaDataPrefix, Uint.from("00ed")]), Uint.from(size));

    await Promise.all(promises);

}


