import Transaction from "../objects/transaction.js";
import Block from "../objects/block.js";
import blockchain from "../storage/blockchain.js";
import utils from "../utils/index.js";
import cryptoHandlers from "../crypto/index.js";
import Proposition from "../objects/proposition.js";
import Attestation from "../objects/attestation.js";
import POS from "../pos/index.js";


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

export class Verification {

    public static verifyAddress(address: string) {
        return address.startsWith("lc0x");
    }

    public static async verifyTransaction(tx: Transaction, chain = "main", coinbase = false) {
        
        // Ensure that all required fields are present
        if (!tx.txid || !tx.senderAddress || !tx.recipientAddress || !tx.amount || !tx.nonce || !tx.timestamp || !tx.signature || !tx.version) {
            return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};
        }

        if (tx.version !== "00") {
            return {cb: false, status: 400, message: "Bad Request. Invalid version."};
        }

        if (!this.verifyAddress(tx.senderAddress)) {
            return {cb: false, status: 400, message: "Bad Request. SenderAddress is not a LeiCoin Address."};
        }

        if (!this.verifyAddress(tx.recipientAddress)) {
            return {cb: false, status: 400, message: "Bad Request. RecipientAddress is not a LeiCoin Address."};
        }

        if (("lc0x" + cryptoHandlers.sha256(tx.senderPublicKey).slice(0, 40)) !== tx.senderAddress) {
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

    private static isValidCoinbaseTransaction(tx: Transaction): {
        cb: true;
    } | {
        cb: false;
        status: 400;
        message: string;
    } {

        if (!tx.txid || !tx.senderAddress || !tx.senderPublicKey || !tx.recipientAddress || !tx.amount || !tx.nonce || !tx.timestamp || !tx.signature || !tx.version)  {
            return {cb: false, status: 400, message: "Bad Request. Invalid Coinbase arguments."};
        }

        if (tx.version !== "00") {
            return {cb: false, status: 400, message: "Bad Request. Invalid Coinbase version."};
        }

        if (cryptoHandlers.sha256(tx, ["txid"]) !== tx.txid) {
            return {cb: false, status: 400, message: "Bad Request. Coinbase hash does not correspond to its data."};
        }

        if (tx.senderAddress !== "lc0x6c6569636f696e6e65745f636f696e62617365" || tx.senderPublicKey !== "6c6569636f696e6e65745f636f696e62617365") {
            return {cb: false, status: 400, message: 'Bad Request. Coinbase Sender Data is invalid.'};
        }

        if (tx.amount !== utils.mining_pow) {
            return {cb: false, status: 400, message: 'Bad Request. Coinbase amount is invalid.'};
        }

        if (tx.nonce !== "0") {
            return {cb: false, status: 400, message: 'Bad Request. Coinbase nonce is invalid.'};
        }

        if (tx.signature !== "0000000000000000000000000000000000000000000000000000000000000000") {
            return {cb: false, status: 400, message: 'Bad Request. Coinbase signature is invalid.'};
        }

        return {cb: true};

    }

    public static async verifyBlock(block: Block): Promise<BlockValidationInvalidResult | BlockValidationValidResult> {

        if (!block.index || !block.hash || !block.previousHash || !block.timestamp || !block.transactions || !block.version) {
            return {cb: false, status: 400, message: "Bad Request. Invalid arguments."};;
        }

        let forkchain = "main";
        let forktype: "child" | "newfork" = "child";
        let forkparent = "main";

        if (block.index === "0") {

            const isGenesisBlockResult = blockchain.chainstate.isValidGenesisBlock(block.hash);

            if (!isGenesisBlockResult.isGenesisBlock)
                return {cb: false, status: 400, message: 'Bad Request. Block is not a valid Genesis Block.'};

            if (isGenesisBlockResult.isForkOFGenesisBlock) {
                forkchain = block.hash;
                forktype = "newfork";
            }

        } else {

            

        }
        
        if (cryptoHandlers.sha256(block, ["hash"]) !== block.hash) {
            return {cb: false, status: 400, message: 'Bad Request. Block hash does not correspond to its data.'};
        }

        const isValidCoinbaseTransactionResult = this.isValidCoinbaseTransaction(block.transactions[0])

        if (!isValidCoinbaseTransactionResult.cb) {
            return isValidCoinbaseTransactionResult;
        }
        
        if (forkchain === "main" || forktype === "newfork") {
            for (const transactionData of block.transactions) {
                const transactionsValid = await this.verifyTransaction(transactionData);
                if (!transactionsValid.cb) return {cb: false, status: 400, message: 'Bad Request. Block includes invalid transactions.'};
            }
        }
        // Ensure that the block contains valid transactions
        return {cb: true, status: 200, message: "Block received and added to the Blockchain.", forkchain: forkchain, forktype: forktype, forkparent: forkparent};
    }

    public static async verifyBlockProposition(proposition: Proposition | null) {

        if (!proposition) return 12501;

        const currentSlot = POS.getCurrentSlot();

        // the following two lines do pretty much the same thing, but I keep it because we don't know if that will still be the case later
        if (proposition.slotIndex.eqn(currentSlot.index)) return 12540;
        if (currentSlot.blockFinalizedStep.hasFinished()) return 12541;

        if (!currentSlot.committee.isProposer(proposition.proposer)) return 12551;
        if (proposition.nonce.eqn(currentSlot.committee.getProposerData().nonce)) return 12508;

        return 12000;

    }

    public static async verifyBlockAttestation(attestation: Attestation | null) {

        if (!attestation) return 12501;

        const currentSlot = POS.getCurrentSlot();

        // the following two lines do pretty much the same thing, but I keep it because we don't know if that will still be the case later
        if (attestation.slotIndex.eqn(currentSlot.index)) return 12540;
        if (currentSlot.blockReceivedStep.hasFinished()) return 12541;

        if (!currentSlot.committee.isAttester(attestation.attester)) return 12561;
        if (attestation.nonce.eqn(currentSlot.committee.getAttesterData(attestation.attester).nonce)) return 12508;

        return 12000;

    }
  
}

export default Verification;