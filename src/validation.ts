import crypto from "crypto";
import { TransactionLike } from "./objects/transaction.js";
import mempool from "./storage/mempool.js";
import { BlockLike } from "./objects/block.js";
import blockchain from "./storage/blockchain.js";
import { Callbacks } from "./utils/callbacks.js";
import utils from "./utils/utils.js";
import EncodingUtils from "./handlers/encodingHandlers.js";
import cryptoHandlers from "./handlers/cryptoHandlers.js";

interface BlockValidationInvalidResult {
    cb: false;
    status: 400 | 500;
    message: string;
}

interface BlockValidationValidResult {
    cb: true;
    status: 200;
    message: string;
    forkchain: string;
    forktype: "child" | "newfork";
    forkparent: string;
}

export class Validation {

    public static validateAddress(address: string) {
        return address.startsWith("lc0x");
    }

    private static validateTXSignature(tx: TransactionLike) {
    
        // Prepare transaction data for verification (exclude the signature and txid)
        const modifyedTransactionData = cryptoHandlers.getPreparedObjectForHashing(tx, ["txid", "signature"]);
    
        // decode the senderPublicKey
        const publicKeyPEM = EncodingUtils.decodeBase64ToPublicKey(tx.senderPublicKey);

        // Verify the signature
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(JSON.stringify(modifyedTransactionData));
        const signatureBuffer = EncodingUtils.encodeBase64ToBuffer(tx.signature);

        return verifier.verify(publicKeyPEM, signatureBuffer);
    }

    public static async validateTransaction(tx: TransactionLike, chain = "main", coinbase = false) {
        
        // Ensure that all required fields are present
        if (!tx.txid || !tx.senderAddress || !tx.senderPublicKey|| !tx.recipientAddress || !tx.amount || !tx.nonce || !tx.timestamp || !tx.signature || !tx.version) {
            return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};
        }

        if (!this.validateTXSignature(tx)) {
            return {cb: false, status: 400, message: "Bad Request. Invalid signature."};
        }

        if (!this.validateAddress(tx.senderAddress)) {
            return {cb: false, status: 400, message: "Bad Request. SenderAddress is not a LeiCoin Address."};
        }

        if (!this.validateAddress(tx.recipientAddress)) {
            return {cb: false, status: 400, message: "Bad Request. SenderAddress is not a LeiCoin Address."};
        }

        if (("lc0x" + cryptoHandlers.sha256(tx.senderPublicKey).slice(0, 38)) !== tx.senderAddress) {
            return {cb: false, status: 400, message: "Bad Request. SenderAddress does not correspond to the Public Key."};
        }

        if (cryptoHandlers.sha256(tx, ["txid"]) !== tx.txid) {
            return {cb: false, status: 400, message: "Bad Request. Transaction hash does not correspond to its data."};
        }

        const senderWallet = await blockchain.chains[chain].wallets.getWallet(tx.senderAddress);

        if (senderWallet.getNonce() !== tx.nonce) {
            
        }

        if (senderWallet.isSubtractMoneyPossible(tx.amount)) {

        }
        
        return {cb: true, status: 200, message: "Transaction received and added to the mempool."};
    }

    private static isValidCoinbaseTransaction(coinbase: TransactionLike): {
        cb: true;
    } | {
        cb: false;
        status: 400;
        message: string;
    } {

        if (!coinbase || !senderAddress || !publicKey || !output || !signature || !input ||) {
            return {cb: false, status: 400, message: "Bad Request. Invalid Coinbase arguments."};
        }

        if (cryptoHandlers.sha256(coinbaseTransaction, ["txid", "coinbase"]) !== txid) {
            return {cb: false, status: 400, message: "Bad Request. Coinbase hash does not correspond to its data."};
        }

        if (![senderAddress, publicKey, input[0].utxoid, signature].every(value => value === "coinbase")) {
            return {cb: false, status: 400, message: 'Bad Request. Coinbase Data is invalid.'};
        }

        if (output[0].amount !== utils.mining_pow) {
            return {cb: false, status: 400, message: 'Bad Request. Coinbase amount is invalid.'};
        }

        return {cb: true};

    }

    public static isValidBlock(block: BlockLike): BlockValidationInvalidResult | BlockValidationValidResult {
        const { index, previousHash, transactions, timestamp, nonce, hash } = block;

        if ((!index && index !== 0) || (!previousHash && index !== 0) || !transactions || !timestamp || !nonce || !hash) {
            return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};;
        }

        let forkchain = "main";
        let forktype: "child" | "newfork" = "child";
        let forkparent = "main";

        if (index === 0) {

            const isGenesisBlockResult = blockchain.isValidGenesisBlock(hash);

            if (!isGenesisBlockResult.isGenesisBlock)
                return {cb: false, status: 400, message: 'Bad Request. Block is not a valid Genesis Block.'};

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
            } else {
                return {cb: false, status: 500, message: 'Internal Server Error. LatestBlockInfoData could not be readed.'};
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

        const isValidCoinbaseTransactionResult = isValidCoinbaseTransaction(transactions[0])

        if (!isValidCoinbaseTransactionResult.cb) {
            return isValidCoinbaseTransactionResult;
        }
        
        if (forkchain === "main" || forktype === "newfork") {
            for (const transactionData of transactions) {
                const transactionsValid = isValidTransaction(transactionData);
                if (!transactionsValid.cb) return {cb: false, status: 400, message: 'Bad Request. Block includes invalid transactions.'};
            }
        }
        // Ensure that the block contains valid transactions
        return {cb: true, status: 200, message: "Block received and added to the Blockchain.", forkchain: forkchain, forktype: forktype, forkparent: forkparent};
    }
  
}

export default Validation;