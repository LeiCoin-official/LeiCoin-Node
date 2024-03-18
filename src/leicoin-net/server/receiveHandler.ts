import mempool from "../../storage/mempool.js";
import Transaction from "../../objects/transaction.js";
import { Callbacks } from "../../utils/callbacks.js";
import cli from "../../utils/cli.js";
import utils from "../../utils/utils.js";
import validation from "../../validation.js"
import blockchain from "../../storage/blockchain.js";
import Block from "../../objects/block.js";


export class ReceiveHandler {

    public static processBlock(data: rawdata: Buffer) {

        const block = utils.createInstanceFromJSON(Block, data);

        if (!blockchain.chainstate.isBlockChainStateMatching(block).valid) {
    
            const validationresult = validation.isValidBlock(block);
    
            if (validationresult.cb) {
    
                if (validationresult.forktype = "newfork") {
                    blockchain.createFork(validationresult.forkchain, validationresult.forkparent, block);
                }
    
                blockchain.chains[validationresult.forkchain].blocks.addBlock(block);
                blockchain.updateLatestBlockInfo(
                    block,
                    validationresult.forkchain,
                    validationresult.forkparent
                );
    
                if (validationresult.forkchain === "main") {
                    mempool.clearMempoolbyBlock(block);
    
                    for (const transactionData of block.transactions) {
                        blockchain.deleteUTXOS(transactionData);
                        blockchain.addUTXOS(transactionData);
                    }
                }
        
                cli.leicoin_net_message.server.success(`Received block with hash ${block.hash} has been validated. Adding to Blockchain.`);
                utils.events.emit("block_receive", rawdata);
            } else {
                cli.leicoin_net_message.server.log(`Received block with hash ${block.hash} is invalid. Validation Result: ${JSON.stringify(validationresult)}`);
            }
    
            return validationresult;
        }
    
        return {cb: false};

    }

    public static processTransaction(data: Buffer) {

        const transaction = utils.createInstanceFromJSON(Transaction, data);
    
        if (!(transaction.txid in mempool.transactions)) {
    
            const validationresult = validation.validateTransaction(transaction);
    
            if (validationresult.cb) {
    
                // Add the transaction to the mempool (replace with your blockchain logic)
                mempool.addTransactionToMempool(transaction);
                
                if (mempool instanceof MempoolWithUnconfirmedUTXOS) {
                    for (const input of transaction.input) {
                        const removeAddedUTXOFromMempoolResult = mempool.removeAddedUTXOFromMempool(transaction.senderAddress, input.utxoid);
                        if (removeAddedUTXOFromMempoolResult.cb === Callbacks.NONE) {
                            mempool.addDeletedUTXOToMempool(transaction.senderAddress, input.utxoid, DeletedUTXO.initFromTXInput(input));
                        }
                    }
                    for (const [index, output] of transaction.output.entries()) {
                        mempool.addAddedUTXOToMempool(output.recipientAddress, `${transaction.txid}_${index}`, AddedUTXO.initFromTXOutput(output));
                    }
                }
        
                cli.leicoin_net_message.server.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);
            } else {
                cli.leicoin_net_message.server.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
            }
    
            return {cb: true, validationresult: validationresult };
        }
    
        //cli.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);
        return { cb: false, validationresult: null };
    
    }
        

}

export default ReceiveHandler;
