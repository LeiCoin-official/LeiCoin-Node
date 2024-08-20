import mempool from "../../storage/mempool.js";
import Transaction from "../../objects/transaction.js";
import cli from "../../cli/cli.js";
import Verification from "../../verification/index.js"
import leiCoinNetClientsHandler from "../client/index.js";
import { LeiCoinNetDataPackage, LNPPX } from "../packages.js";
import { DataUtils } from "../../utils/dataUtils.js";
import { Uint } from "../../binary/uint.js";

export default class TransactionPipeline {

    public static async receive(type: LNPPX, data: Uint) {

        const transaction = DataUtils.createInstanceFromJSON(Transaction, data);
    
        if (!(transaction.txid.toHex() in mempool.transactions)) {
    
            const validationresult = await Verification.verifyTransaction(transaction);
    
            if (validationresult === 12000) {

                mempool.addTransactionToMempool(transaction);
        
                cli.leicoin_net.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);

                this.broadcast(type, data);

            } else {
                cli.leicoin_net.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
            }
        }
    
        //cli.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);

    }

    public static async broadcast(type: LNPPX, data: Uint) {
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }

}