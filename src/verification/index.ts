import Transaction from "../objects/transaction.js";
import Block from "../objects/block.js";
import blockchain from "../storage/blockchain.js";
import Proposition from "../objects/proposition.js";
import Attestation from "../objects/attestation.js";
import POS from "../pos/index.js";
import { VCode } from "./codes.js";
import { AddressHex } from "../objects/address.js";
import { PX } from "../objects/prefix.js";


interface BlockValidationValidResult {
    status: 12000;
    forkchain: string;
    forktype: "child" | "newfork";
    forkparent: string;
}

interface BlockValidationInvalidResult {
    status: Exclude<VCode, 12000>;
}


export class Verification {

    public static verifyAddress(address: AddressHex, expectedPrefix: PX = PX.A_00): boolean {
        return address.slice(0, 1).eq(expectedPrefix);
    }

    public static async verifyTransaction(tx: Transaction, chain = "main"): Promise<VCode> {
        
        if (!tx) return 12501;
        if (tx.txid.eqn(tx.calculateHash())) return 12504;

        const senderWallet = await blockchain.chains[chain].wallets.getWallet(tx.senderAddress);

        if (senderWallet.getNonce().eqn(tx.nonce)) return 12508;
        if (!senderWallet.isSubtractMoneyPossible(tx.amount)) return 12524;
        
        return 12000;
    }

    public static async verifyBlock(block: Block): Promise<BlockValidationValidResult | BlockValidationInvalidResult> {

        if (!block) return { status: 12501 };

        let forkchain = "main";
        let forktype: "child" | "newfork" = "child";
        let forkparent = "main";

        if (block.index.eq(0)) {

            const isGenesisBlockResult = blockchain.chainstate.isValidGenesisBlock(block.hash);

            if (!isGenesisBlockResult.isGenesisBlock) return { status: 12533 };

            if (isGenesisBlockResult.isForkOFGenesisBlock) {
                forkchain = block.hash.toHex();
                forktype = "newfork";
            }

        } else {

            const chainstateMatch = blockchain.chainstate.isBlockChainStateMatching(block);

            if (!chainstateMatch.valid) return { status: 12533 };

            forkchain = chainstateMatch.name;
            forktype = chainstateMatch.type;
            forkparent = chainstateMatch.parent;

        }
        
        if (block.calculateHash().eqn(block.hash)) {
            return { status: 12504 };
        }
        
        for (const transactionData of block.transactions) {
            const transactionsValid = await this.verifyTransaction(transactionData);
            if (transactionsValid !== 12000) return { status: 12520 };
        }
        
        // Ensure that the block contains valid transactions
        return { status: 12000, forkchain: forkchain, forktype: forktype, forkparent: forkparent };
    }

    public static async verifyBlockProposition(proposition: Proposition | null): Promise<VCode> {

        if (!proposition) return 12501;

        const currentSlot = POS.getCurrentSlot();

        // the following two lines do pretty much the same thing, but I keep it because we don't know if that will still be the case later
        if (proposition.slotIndex.eqn(currentSlot.index)) return 12540;
        if (currentSlot.blockFinalizedStep.hasFinished()) return 12541;

        if (!currentSlot.committee.isProposer(proposition.proposer)) return 12551;

        const proposerData = currentSlot.committee.getProposerData();

        if (proposerData.proposed) return 12552;
        if (proposition.nonce.eqn(proposerData.nonce)) return 12508;

        return 12000;

    }

    public static async verifyBlockAttestation(attestation: Attestation | null): Promise<VCode> {

        if (!attestation) return 12501;

        const currentSlot = POS.getCurrentSlot();

        // the following two lines do pretty much the same thing, but I keep it because we don't know if that will still be the case later
        if (attestation.slotIndex.eqn(currentSlot.index)) return 12540;
        if (currentSlot.blockReceivedStep.hasFinished()) return 12541;

        if (!currentSlot.committee.isAttester(attestation.attester)) return 12561;

        const attesterData = currentSlot.committee.getAttesterData(attestation.attester);

        if (attesterData.vote !== "none") return 12562;
        if (attestation.nonce.eqn(attesterData.nonce)) return 12508;

        return 12000;

    }
  
}

export default Verification;