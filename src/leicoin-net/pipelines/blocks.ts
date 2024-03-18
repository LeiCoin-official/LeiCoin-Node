import mempool from "../../storage/mempool.js";
import cli from "../../utils/cli.js";
import utils from "../../utils/utils.js";
import validation from "../../validation.js"
import blockchain from "../../storage/blockchain.js";
import Block from "../../objects/block.js";
import leiCoinNetClientsHandler from "../client/index.js";
import { LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";

export default class BlockPipeline {

    public static async receive(type: LeiCoinNetDataPackageType, data: string) {
        
        const block = utils.createInstanceFromJSON(Block, data);

        if (!blockchain.chainstate.isBlockChainStateMatching(block).valid) {
    
            const validationresult = validation.isValidBlock(block);
    
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
                
            } else {
                cli.leicoin_net_message.server.log(`Received block with hash ${block.hash} is invalid. Validation Result: ${JSON.stringify(validationresult)}`);
            }
    
            return validationresult;
        }
    
        return {cb: false};

    }

    public static async broadcast(rawData: Buffer) {
        await leiCoinNetClientsHandler.broadcastData(rawData);
    }
    

}