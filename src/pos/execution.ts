import cli from "../cli/cli.js";
import { type Block } from "../objects/block.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import { type BlockValidationResult } from "../verification/index.js";


export class Execution {

    static async executeBlock(block: Block, validationresult: BlockValidationResult) {
    
        if (validationresult.status !== 12000) {
            cli.leicoin_net.server.info(`Block with hash ${block.hash.toHex()} is invalid. Validation Result: ${JSON.stringify(validationresult)}`);
            return;
        }

        if (validationresult.forktype === "newfork") {
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
        
        cli.leicoin_net.server.success(`Block with hash ${block.hash.toHex()} has been validated, executed and added to Blockchain.`);
    }

}

