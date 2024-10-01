import mempool from "../../../storage/mempool.js";
import Transaction from "../../../objects/transaction.js";
import cli from "../../../cli/cli.js";
import Verification from "../../../verification/index.js"
import { Uint } from "../../../binary/uint.js";
import { LNMsgContent, LNMsgType } from "../messageTypes.js";
import { LNBroadcastingMsgHandler, LNMsgHandler } from "../abstractChannel.js";
import { Dict } from "../../../utils/dataUtils.js";

export class NewTransactionMsg extends LNMsgContent {
    
}

export namespace NewTransactionMsg {
    export const TYPE = LNMsgType.from("8356"); // NEW_TRANSACTION
    
    export const Handler = new class Handler extends LNBroadcastingMsgHandler {
        readonly id = TYPE;

        async receive(data: Uint) {

            const transaction = Transaction.fromDecodedHex(data) as Transaction;
        
            if (!(transaction.txid.toHex() in mempool.transactions)) {
        
                const validationresult = await Verification.verifyTransaction(transaction);
        
                if (validationresult === 12000) {

                    mempool.addTransactionToMempool(transaction);
            
                    cli.leicoin_net.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);

                    this.broadcast(data);

                } else {
                    cli.leicoin_net.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
                }
            }
        
            //cli.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);

        }

    }
}

export class GetTransactionsMsg extends LNMsgContent {}

export namespace GetTransactionsMsg {
    export const TYPE = LNMsgType.from("09aa"); // GET_TRANSACTIONS
    
    export const Handler = new class Handler extends LNMsgHandler {
        readonly id = TYPE;
        
        async receive(data: Uint) {
            
        }
        
        async send(data: Uint) {
            
        }
    }
}
