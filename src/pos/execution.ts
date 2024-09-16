import cli from "../cli/cli.js";
import { type Block } from "../objects/block.js";
import { Blockchain } from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import { type BlockValidationResult } from "../verification/index.js";


export class Execution {

    static async executeBlock(block: Block, validationresult: BlockValidationResult) {
    
        if (validationresult.status !== 12000) {
            cli.leicoin_net.info(`Block with hash ${block.hash.toHex()} is invalid. Validation Result: ${JSON.stringify(validationresult)}`);
            return;
        }

        const { targetChain, parentChain } = validationresult;

        if (targetChain !== parentChain) { // New fork if targetChain is different from parentChain
            Blockchain.createFork(validationresult.targetChain, validationresult.parentChain, block);
        }
    
        Blockchain.chains[targetChain].blocks.addBlock(block);
        Blockchain.chainstate.updateChainStateByBlock(
            targetChain,
            parentChain,
            block,
        );
    
        if (targetChain === "main") {
            mempool.clearMempoolbyBlock(block);
            
            await Blockchain.wallets.adjustWalletsByBlock(block);
        }
        
        cli.leicoin_net.success(`Block on Slot ${block.slotIndex.toBigInt()} with hash ${block.hash.toHex()} has been validated, executed and added to Blockchain. Chain: ${targetChain}`);
    }

}

