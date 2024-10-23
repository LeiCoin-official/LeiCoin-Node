import mempool from "../../../storage/mempool.js";
import Transaction from "../../../objects/transaction.js";
import cli from "../../../cli/cli.js";
import Verification from "../../../verification/index.js"
import { Uint } from "low-level";
import { LNMsgContent, LNMsgType } from "../messageTypes.js";
import { LNBroadcastingMsgHandler, LNMsgHandler } from "../abstractChannel.js";
import { Dict } from "../../../utils/dataUtils.js";
import { BE, type DataEncoder } from "../../../encoding/binaryEncoders.js";
import { type LNSocket } from "../../socket.js";

export class NewTransactionMsg extends LNMsgContent {
    
    constructor(readonly transaction: Transaction) {super()}
    
    protected static fromDict(obj: Dict<any>) {
        return new NewTransactionMsg(obj.transaction)
    }

    protected static readonly encodingSettings: DataEncoder[] = [
        BE.Object("transaction", Transaction)
    ]

}

export namespace NewTransactionMsg {
    export const TYPE = LNMsgType.from("8356"); // NEW_TRANSACTION
    
    export const Handler = new class Handler extends LNBroadcastingMsgHandler {

        async receive(data: NewTransactionMsg) {

            const transaction = data.transaction;
        
            if (!(transaction.txid.toHex() in mempool.transactions)) {
        
                const validationresult = await Verification.verifyTransaction(transaction);
        
                if (validationresult === 12000) {

                    mempool.addTransactionToMempool(transaction);
            
                    cli.leicoin_net.success(`Received Transaction with hash ${transaction.txid} has been validated. Adding to Mempool.`);

                    return data;

                } else {
                    cli.leicoin_net.error(`Transaction with hash ${transaction.txid} is invalid. Error: ${JSON.stringify(validationresult)}`);
                }
            }
        
            //cli.ws_client_message.error(`Transaction with hash ${transaction.txid} is invalid.`);
            return null;
        }

    }
}

export class GetTransactionsMsg extends LNMsgContent {}

export namespace GetTransactionsMsg {
    export const TYPE = LNMsgType.from("09aa"); // GET_TRANSACTIONS
    
    export const Handler = new class Handler extends LNMsgHandler {
        readonly acceptedMgs = "REQUEST";
        
        async receive(data: GetTransactionsMsg, socket: LNSocket) {
            return null;
            
        }
        
        async send(data: Uint) {
            
        }
    }
}
