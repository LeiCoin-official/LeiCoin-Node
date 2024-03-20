import mempool from "../../storage/mempool.js";
import Transaction from "../../objects/transaction.js";
import cli from "../../utils/cli.js";
import utils from "../../utils/index.js";
import Verification from "../../verification.js"
import leiCoinNetClientsHandler from "../client/index.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";

export default class TransactionPipeline {

    public static async receive(type: LeiCoinNetDataPackageType, data: string) {

        const transaction = utils.createInstanceFromJSON(Transaction, data);
    
        if (!(transaction.txid in mempool.transactions)) {
    
            const validationresult = await Verification.verifyTransaction(transaction);
    
            if (validationresult.cb) {

                mempool.addTransactionToMempool(transaction);
        
                cli.leicoin_net_message.server.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);

                this.broadcast(type, data);

            } else {
                cli.leicoin_net_message.server.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
            }
        }
    
        //cli.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);

    }

    public static async broadcast(type: LeiCoinNetDataPackageType, data: string) {
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }

}