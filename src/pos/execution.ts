import cli from "../cli/cli.js";
import { type Block } from "../objects/block.js";
import blockchain from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import Verification from "../verification/index.js";
import { type VCommittee } from "./committee.js";
import POS from "./index.js";


export class Execution {

    static async executeBlock(block: Block): ReturnType<typeof Verification.verifyBlock> {

        if (!block || !blockchain.chainstate.isBlockChainStateMatching(block).valid) {
            return {status: 12533};
        }
    
        const validationresult = await Verification.verifyBlock(block);
    
        if (validationresult.status !== 12000) {
            cli.leicoin_net_message.server.info(`Block with hash ${block.hash} is invalid. Validation Result: ${JSON.stringify(validationresult)}`);
            return validationresult;
        }

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
        
        cli.leicoin_net_message.server.success(`Block with hash ${block.hash} has been validated, executed and added to Blockchain.`);
        return validationresult;
    }

}

