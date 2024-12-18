import cli from "../cli/cli.js";
import { type Block } from "../objects/block.js";
import { Blockchain } from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import { VCodes } from "../verification/codes.js";
import { type ValidationResult } from "../verification/index.js";


export class Execution {

    static async executeBlock(block: Block, validationresult: ValidationResult.BlockValid) {

        let forked = false;

        const { targetChain, parentChain } = validationresult;

        if (targetChain !== parentChain) { // New fork if targetChain is different from parentChain
            await Blockchain.createFork(validationresult.targetChain, validationresult.parentChain, block);
            forked = true;
        }
    
        Blockchain.chains[targetChain].blocks.add(block);
        Blockchain.chainstate.updateChainStateByBlock(
            targetChain,
            parentChain,
            block,
        );
    
        if (targetChain === "main") {
            mempool.clearMempoolbyBlock(block);
            
            await Blockchain.wallets.adjustWalletsByBlock(block);
        }
        
        return { forked };
    }

}

