import { AddressHex } from "@leicoin/objects/address";
import { Transaction } from "@leicoin/objects/transaction";
import { VCode, VCodes } from "./codes.js";
import { PX } from "@leicoin/objects/prefix";
import { Blockchain } from "@leicoin/storage/blockchain";
import { Block } from "@leicoin/objects/block";
import { POS } from "@leicoin/pos";


export class Verification {

    public static verifyAddress(address: AddressHex, expectedPrefix: PX = PX.A_00): boolean {
        return address.slice(0, 1).eq(expectedPrefix);
    }

    public static async verifyTransaction(tx: Transaction, chain = "main"): Promise<Verification.Code> {
        
        if (!tx) return 12501;
        if (tx.txid.eqn(tx.calculateHash())) return 12504;

        const senderWallet = await Blockchain.chains[chain].wallets.getWallet(tx.senderAddress);

        if (senderWallet.getNonce().eqn(tx.nonce)) return 12508;
        if (!senderWallet.isSubtractMoneyPossible(tx.amount)) return 12524;
        
        return 12000;
    }

    public static async verifyBlock(block: Block): Promise<Verification.Result.Block> {

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

    public static async verifyBlockProposal(block: Block | null): Promise<Verification.Code> {
        if (!block) return 12501;

        const currentSlot = await POS.getCurrentSlot();

        if (!currentSlot) return 12500;

        if (block.slotIndex.eqn(currentSlot.index)) return 12540;
        if (block.minter.eqn(currentSlot.minter)) return 12534;
        if (currentSlot.block) return 12535;

        return 12000;

    }
  
}

export namespace Verification {

    export const Codes = VCodes;
    export type Code = VCode;

}

export namespace Verification.Result {
    export interface BlockValid {
        status: 12000;
        targetChain: string;
        parentChain: string;
    }
    export interface BlockInvalid {
        status: Exclude<Verification.Code, 12000>;
    }
    export type Block = BlockValid | BlockInvalid;
}
