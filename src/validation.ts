import crypto from "crypto";
import cryptoHandler from "./handlers/cryptoHandlers.js";
import Transaction, { TransactionLike } from "./objects/transaction.js";
import mempool from "./handlers/storage/mempool.js";
import Block, { BlockLike } from "./objects/block.js";
import blockchain from "./handlers/storage/blockchain.js";
import { Callbacks } from "./utils/callbacks.js";
import utils from "./utils.js";


function isValidTransaction(transaction: TransactionLike) {

    function isTransactionSignatureValid(transaction: TransactionLike) {
        const { signature, publicKey } = transaction;
    
        // Prepare transaction data for verification (exclude the signature)
        const modifyedTransactionData = cryptoHandler.getPreparedObjectForHashing(transaction, ["txid", "signature"])
    
        // decode the senderAddress
        const publicKeyPEM = cryptoHandler.decodeEncodedPublicKeyToPublicKey(publicKey);

        // Verify the signature
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(JSON.stringify(modifyedTransactionData));
        const signatureBuffer = cryptoHandler.base64EncodeToBuffer(signature);
        const isVerified = verifier.verify(publicKeyPEM, signatureBuffer);
    
        return isVerified;
    }


    const { txid, senderAddress, publicKey, output, input, signature } = transaction;
    
    // Ensure that all required fields are present
    if (!txid || !senderAddress || !publicKey || !output || !signature || !input) {
        return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};;
    }

    if (!isTransactionSignatureValid(transaction)) {
        return {cb: false, status: 400, message: "Bad Request. Invalid signature."};
    }

    const publicKeyPEM = cryptoHandler.decodeEncodedPublicKeyToPublicKey(publicKey);
    if (crypto.createHash('sha256').update(publicKeyPEM).digest('hex') !== senderAddress) {
        return {cb: false, status: 400, message: "Bad Request. SenderAddress does not correspond to the Public Key."};
    }

    if (crypto.createHash('sha256').update(JSON.stringify(cryptoHandler.getPreparedObjectForHashing(transaction, ["txid"]))).digest('hex') !== txid) {
        return {cb: false, status: 400, message: "Bad Request. Transaction hash does not correspond to its data."};
    }

    if (txid in mempool.transactions) {
        return {cb: false, status: 400, message: 'Bad Request. Transaction aleady exists in Mempool'};
    }

    let utxo_input_amount = 0;
    let utxo_output_amount = 0;

    let added_input_utxos: string[] = [];

    for (let input_utxo of input) {
        if (added_input_utxos.includes(input_utxo.utxoid)) {
            return {cb: false, status: 400, message: 'Bad Request. Transaction includes double spending UTXO inputs.'};
        }
        let utxoData = blockchain.getUTXOS(senderAddress, input_utxo.utxoid);
        if (utxoData.cb !== Callbacks.SUCCESS) {
            if (utxoData.cb === Callbacks.NONE) {
                return {cb: false, status: 400, message: 'Bad Request. Transaction includes input UTXO that does not exists.'};
            }
            return {cb: false, status: 500, message: 'Internal Server Error. Transaction includes input UTXO that could not be readed.'};
        }
        added_input_utxos.push(input_utxo.utxoid);
        utxo_input_amount += utxoData.data.amount;
    }

    for (let output_utxo of output) {
        utxo_output_amount += output_utxo.amount;
    }

    if (utxo_input_amount !== utxo_output_amount) {
        return {cb: false, status: 400, message: 'Bad Request. Transaction output amount does not correspond to the input amount.'};
    }

    if (utxo_output_amount <= 0) {
        return {cb: false, status: 400, message: 'Bad Request. Transaction output amount must be greater than zero.'};
    }
    
    return {cb: true, status: 200, message: "Transaction received and added to the mempool."};
}

function isValidBlock(block: BlockLike) {
    const { index, previousHash, transactions, timestamp, nonce, coinbase, hash } = block;

    if ((!index && index !== 0) || (!previousHash && index !== 0) || !transactions || !timestamp || !nonce || !coinbase || !hash) {
        return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};;
    }

    let forktype = "none";
    let forkchain = "none";
    let forkparent = "none"

    if (index === 0) {

        const isGenesisBlockResult = blockchain.isGenesisBlock();

        if (!isGenesisBlockResult.isGenesisBlock) return {cb: false, status: 400, message: 'Bad Request. Previous Block does not exists.'};

        forkchain = "main";
        forktype = "child";
        forkparent = "main";

        if (isGenesisBlockResult.isForkOFGenesisBlock) {
            forkchain = hash;
            forktype = "newfork";
        } 

    } else {

        const latestblockinfoFileData = blockchain.getLatestBlockInfo();

        if (latestblockinfoFileData.cb === Callbacks.SUCCESS) {
            let previousBlockInfoExists = false;
            for (const [forkName, latestANDPreviousForkBlockInfo] of Object.entries(latestblockinfoFileData.data)) {
                const previousBlockInfo = latestANDPreviousForkBlockInfo.previousBlockInfo;
                const latestBlockInfo = latestANDPreviousForkBlockInfo.latestBlockInfo;
                if (latestBlockInfo.hash === hash) {
                    return {cb: false, status: 400, message: 'Bad Request. Block aleady exists.'};
                } else if ((latestBlockInfo.hash === previousHash) && ((latestBlockInfo.index + 1) === index)) {
                    forkchain = forkName;
                    forktype = "child";
                    forkparent = forkName;
                    previousBlockInfoExists = true;
                } else if ((previousBlockInfo.hash === previousHash) && ((previousBlockInfo.index + 1) === index)) {
                    forkchain = hash;
                    forktype = "newfork";
                    forkparent = forkName;
                    previousBlockInfoExists = true;
                }
            }
            if (!previousBlockInfoExists) {
                return {cb: false, status: 400, message: 'Bad Request. Block is not a child of a valid blockchain or forkchain'};   
            }
        }

    }
    
    if (crypto.createHash('sha256').update(JSON.stringify(cryptoHandler.getPreparedObjectForHashing(block, ["hash"]))).digest('hex') !== hash) {
        return {cb: false, status: 400, message: 'Bad Request. Block hash does not correspond to its data.'};
    }


    // Verify that the hash of the block meets the mining difficulty criteria
    const hashPrefix = '0'.repeat(utils.mining_difficulty);
    if (hash.substring(0, utils.mining_difficulty) !== hashPrefix) {
        return {cb: false, status: 400, message: 'Bad Request. Block hash is invalid.'};
    }

    if (coinbase.amount !== utils.mining_pow) {
        return {cb: false, status: 400, message: 'Bad Request. Coinbase amount is invalid.'};
    }
  
    // Ensure that the block contains valid transactions (add your validation logic here)
    for (const [, transactionData] of Object.entries(transactions)) {
        const transactionsValid = isValidTransaction(transactionData);
        if (!transactionsValid.cb) return {cb: false, status: 400, message: 'Bad Request. Block includes invalid transactions.'};
    }
    return {cb: true, status: 200, message: "Block received and added to the Blockchain.", forkchain: forkchain, forktype: forktype, forkparent: forkparent};
}
  
export default {
    isValidTransaction,
    isValidBlock
}