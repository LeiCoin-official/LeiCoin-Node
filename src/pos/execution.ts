import cli from "../cli/cli.js";
import { type Block } from "../objects/block.js";
import { Blockchain } from "../storage/blockchain.js";
import mempool from "../storage/mempool.js";
import { VCodes } from "../verification/codes.js";
import { type BlockValidationResult } from "../verification/index.js";


export class Execution {

    static async executeBlock(block: Block, validationresult: BlockValidationResult) {
    
        if (validationresult.status !== 12000) {
            cli.pos.info(`Block with hash ${block.hash.toHex()} is invalid. Validation Result: Code: ${validationresult.status} Message: ${VCodes[validationresult.status]}`);
            return;
        }

        const { targetChain, parentChain } = validationresult;

        if (targetChain !== parentChain) { // New fork if targetChain is different from parentChain
            await Blockchain.createFork(validationresult.targetChain, validationresult.parentChain, block);
            cli.pos.info(`New Fork ${targetChain} created from ${parentChain} at block ${block.index.toBigInt()}`);
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
        
        cli.pos.success(`Block on Slot ${block.slotIndex.toBigInt()} has been validated, executed and added to Blockchain. (Hash: ${block.hash.toHex()}, Index ${block.index.toBigInt()}, Target Chain: ${targetChain})`);
    }

}

