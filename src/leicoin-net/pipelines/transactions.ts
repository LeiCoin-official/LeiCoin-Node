import mempool from "../../storage/mempool.js";
import Transaction from "../../objects/transaction.js";
import cli from "../../utils/cli.js";
import utils from "../../utils/index.js";
import validation from "../../validation.js"
import leiCoinNetClientsHandler from "../client/index.js";
import { LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";

export default class TransactionPipeline {

    public static async receive(type: LeiCoinNetDataPackageType, data: string) {

        const transaction = utils.createInstanceFromJSON(Transaction, data);
    
        if (!(transaction.txid in mempool.transactions)) {
    
            const validationresult = await validation.validateTransaction(transaction);
    
            if (validationresult.cb) {

                mempool.addTransactionToMempool(transaction);
        
                cli.leicoin_net_message.server.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);
            } else {
                cli.leicoin_net_message.server.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
            }
    
            return {cb: true, validationresult: validationresult };
        }
    
        //cli.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);
        return { cb: false, validationresult: null };

    }

    public static async broadcast(rawData: Buffer) {
        await leiCoinNetClientsHandler.broadcastData(rawData);
    }

}