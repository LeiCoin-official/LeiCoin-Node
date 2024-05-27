import mempool from "../../storage/mempool.js";
import cli from "../../utils/cli.js";
import Verification from "../../verification/index.js"
import blockchain from "../../storage/blockchain.js";
import Block from "../../objects/block.js";
import leiCoinNetClientsHandler from "../client/index.js";
import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import { DataUtils } from "../../utils/dataUtils.js";

export default class BlockPipeline {

    public static async receive(type: LeiCoinNetDataPackageType, data: string) {
        
        const block = DataUtils.createInstanceFromJSON(Block, data);

        if (!blockchain.chainstate.isBlockChainStateMatching(block).valid) {
    
            const validationresult = await Verification.verifyBlock(block);
    
            if (validationresult.cb) {
    
                if (validationresult.forktype = "newfork") {
                    blockchain.createFork(validationresult.forkchain, validationresult.forkparent, block);
                }
    
                blockchain.chains[validationresult.forkchain].blocks.addBlock(block);
                blockchain.chainstate.updateLatestBlockInfo (
                    block,
                    validationresult.forkchain,
                    validationresult.forkparent
                );
    
                if (validationresult.forkchain === "main") {
                    mempool.clearMempoolbyBlock(block);
                    
                    await blockchain.wallets.adjustWalletsByBlock(block);
                }
        
                cli.leicoin_net_message.server.success(`Received block with hash ${block.hash} has been validated. Adding to Blockchain.`);
                
                this.broadcast(type, data);

            } else {
                cli.leicoin_net_message.server.info(`Received block with hash ${block.hash} is invalid. Validation Result: ${JSON.stringify(validationresult)}`);
            }

        }

    }

    public static async broadcast(type: LeiCoinNetDataPackageType, data: string) {
        await leiCoinNetClientsHandler.broadcastData(LeiCoinNetDataPackage.create(type, data));
    }
    

}