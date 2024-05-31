import mempool from "../../storage/mempool.js";
import Transaction from "../../objects/transaction.js";
import cli from "../../utils/cli.js";
import Verification from "../../verification/index.js"
import leiCoinNetClientsHandler from "../client/index.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import { DataUtils } from "../../utils/dataUtils.js";
import { Uint } from "../../utils/binary.js";

export default class TransactionPipeline {

    public static async receive(type: LeiCoinNetDataPackageType, data: Uint) {

        const transaction = DataUtils.createInstanceFromJSON(Transaction, data);
    
        if (!(transaction.txid.toHex() in mempool.transactions)) {
    
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

    public static async broadcast(type: LeiCoinNetDataPackageType, data: Uint) {
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }

}