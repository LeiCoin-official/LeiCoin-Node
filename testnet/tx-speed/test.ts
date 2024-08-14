import { AddressHex } from "../../src/objects/address.js";
import Block from "../../src/objects/block.js";
import Transaction from "../../src/objects/transaction.js";
import blockchain from "../../src/storage/blockchain.js";
import { Uint256 } from "../../src/utils/binary.js";


function createWallets() {
    blockchain.wallets.setWallet()
}

function createRnadomTransaction() {



    const tx = new Transaction(
        Uint256.empty(),
    );
    
}

function createTestBlock() {
    new Block() {

    }
}


