import Transaction from "../objects/transaction.js";
import Block from "../objects/block.js";
import { Blockchain } from "../storage/blockchain.js";
import POS from "../pos/index.js";
import { VCode } from "./codes.js";
import { AddressHex } from "../objects/address.js";
import { PX } from "../objects/prefix.js";

export namespace ValidationResult {
    export interface BlockValid {
        status: 12000;
        targetChain: string;
        parentChain: string;
    }
    export interface BlockInvalid {
        status: Exclude<VCode, 12000>;
    }
    export type BlockValidationResult = BlockValid | BlockInvalid;
}

export class Verification {

    public static verifyAddress(address: AddressHex, expectedPrefix: PX = PX.A_00): boolean {
        return address.slice(0, 1).eq(expectedPrefix);
    }

    public static async verifyTransaction(tx: Transaction, chain = "main"): Promise<VCode> {
        
        if (!tx) return 12501;
        if (tx.txid.eqn(tx.calculateHash())) return 12504;

        const senderWallet = await Blockchain.chains[chain].wallets.getWallet(tx.senderAddress);

        if (senderWallet.getNonce().eqn(tx.nonce)) return 12508;
        if (!senderWallet.isSubtractMoneyPossible(tx.amount)) return 12524;
        
        return 12000;
    }

    public static async verifyBlock(block: Block): Promise<ValidationResult.BlockValidationResult> {

        if (!block) return { status: 12501 };

        const chainstateMatch = Blockchain.chainstate.isBlockChainStateMatching(block);
        if (chainstateMatch.status !== 12000) return chainstateMatch;

        let { targetChain, parentChain } = chainstateMatch;
        
        if (block.calculateHash().eqn(block.hash)) {
            return { status: 12504 };
        }
        
        for (const transactionData of block.body.transactions) {
            const transactionsValid = await this.verifyTransaction(transactionData);
            if (transactionsValid !== 12000) return { status: 12520 };
        }
        
        // Ensure that the block contains valid transactions
        return { status: 12000, targetChain: targetChain, parentChain: parentChain };
    }

    public static async verifyMintedBlock(block: Block | null): Promise<VCode> {
        if (!block) return 12501;

        const currentSlot = await POS.getCurrentSlot();

        if (!currentSlot) return 12500;

        if (block.slotIndex.eqn(currentSlot.index)) return 12540;
        if (block.minter.eqn(currentSlot.minter)) return 12534;
        if (currentSlot.block) return 12535;

        return 12000;

    }
  
}

export default Verification;